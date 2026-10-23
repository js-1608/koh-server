import { Request, Response } from 'express';
import { memoryStore } from '../services/storeService';

export const getPlanningScenarios = async (req: Request, res: Response) => {
  try {
    const { monthlyMarketingBudget, amazonBudget, d2cBudget, blinkitBudget } = req.query;

    const totalBudget = Number(monthlyMarketingBudget) || 450000;
    const amz = Number(amazonBudget) || totalBudget * 0.4;
    const d2c = Number(d2cBudget) || totalBudget * 0.35;
    const blk = Number(blinkitBudget) || totalBudget * 0.25;

    // Projected ROAS from historical marketing data
    const amzRoas = 4.2;
    const d2cRoas = 3.8;
    const blkRoas = 3.5;

    const projectedAmzRevenue = amz * amzRoas;
    const projectedD2cRevenue = d2c * d2cRoas;
    const projectedBlkRevenue = blk * blkRoas;
    const totalProjectedRevenue = projectedAmzRevenue + projectedD2cRevenue + projectedBlkRevenue;

    // Average unit price ₹230
    const avgSellingPrice = 230;
    const totalProjectedUnits = Math.round(totalProjectedRevenue / avgSellingPrice);

    // Production & Cultivation engine
    const productionRequirements = memoryStore.skus.map(sku => {
      const shareOfSales = 0.25; // 25% equal mix or based on catalog
      const unitsNeeded = Math.round(totalProjectedUnits * shareOfSales);
      const currentStock = sku.currentStock;
      const deficitUnits = Math.max(0, unitsNeeded - currentStock);
      const finishedKgNeeded = (deficitUnits * sku.packWeightGm) / 1000;

      // Find matching crop master for dehydration yield %
      const crop = memoryStore.cropMasters.find(c => c.cropName.toLowerCase().includes(sku.produceSource.toLowerCase()) || sku.produceSource.toLowerCase().includes(c.cropName.toLowerCase())) || memoryStore.cropMasters[0];
      const yieldPct = crop ? crop.dehydrationYieldPercent : 8.0;
      const rawKgNeeded = yieldPct > 0 ? parseFloat(((finishedKgNeeded / yieldPct) * 100).toFixed(1)) : 0;
      const acresNeeded = crop && crop.freshYieldPerAcreKg > 0 ? parseFloat((rawKgNeeded / crop.freshYieldPerAcreKg).toFixed(2)) : 0;
      const estimatedProcurementCost = rawKgNeeded * (crop ? crop.marketRatePerKg : 35);

      return {
        skuCode: sku.skuCode,
        skuName: sku.name,
        produceSource: sku.produceSource,
        unitsNeeded,
        currentStock,
        deficitUnits,
        finishedKgNeeded: parseFloat(finishedKgNeeded.toFixed(1)),
        yieldPercent: yieldPct,
        rawKgNeeded,
        acresNeeded,
        estimatedProcurementCost
      };
    });

    // Cross-system intelligence warnings
    const crossSystemFlags = [
      {
        type: 'Inventory',
        severity: 'high',
        title: 'Stockout Risk on Carrot Crunchies',
        description: 'Crispy Sweet Carrot Crunchies (95 units in stock) has only 6 days of runway at current sales velocity.',
        action: 'Trigger urgent factory dehydration batch'
      },
      {
        type: 'Procurement',
        severity: 'medium',
        title: 'Sowing Deadline Approaching for Winter Carrot',
        description: '3.0 acres carrot sowing required by Oct 15 to meet Q4 demand surge.',
        action: 'Assign 2 additional farmers in Chevella cluster'
      },
      {
        type: 'Production',
        severity: 'low',
        title: 'High Yield Efficiency in Dryer B2',
        description: 'Moringa drying yield observed at 11.48% (vs 11.00% benchmark).',
        action: 'Replicate temp curve to Dryer A1'
      },
      {
        type: 'Marketing',
        severity: 'high',
        title: 'High ROAS Ad Asset Flagged for Budget Boost',
        description: 'Amla Pure Gold Reel is delivering 3.8x ROAS on Meta with low CAC.',
        action: 'Increase daily ad spend by ₹2,500'
      }
    ];

    return res.json({
      inputs: { totalBudget, amz, d2c, blk },
      projections: {
        projectedRevenue: totalProjectedRevenue,
        projectedUnits: totalProjectedUnits,
        channelBreakdown: {
          amazon: { spend: amz, roas: amzRoas, revenue: projectedAmzRevenue },
          d2c: { spend: d2c, roas: d2cRoas, revenue: projectedD2cRevenue },
          blinkit: { spend: blk, roas: blkRoas, revenue: projectedBlkRevenue }
        }
      },
      productionRequirements,
      crossSystemFlags
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
