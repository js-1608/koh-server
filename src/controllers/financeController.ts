import { Request, Response } from 'express';
import { memoryStore } from '../services/storeService';

export const getPnlEntries = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.pnlEntries);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPnlByMonth = async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    let entry = memoryStore.pnlEntries.find(p => p.month === month);
    if (!entry) {
      entry = memoryStore.pnlEntries[0];
    }
    return res.json(entry);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePnlEntry = async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    const { revenue, fixedCosts, notes } = req.body;

    let index = memoryStore.pnlEntries.findIndex(p => p.month === month);
    if (index === -1) {
      // Create new month entry
      const newEntry = {
        _id: `pnl_${Date.now()}`,
        month,
        revenue: { d2c: 0, amazon: 0, blinkit: 0, b2b: 0, exports: 0, totalRevenue: 0 },
        cogs: { rawMaterialProcurement: 0, processingLabour: 0, packagingCost: 0, factoryUtilities: 0, totalCogs: 0 },
        grossProfit: 0,
        grossMarginPercent: 0,
        operatingExpenses: {
          marketingAdsMeta: 0, marketingAdsGoogle: 0, marketingAdsAmazon: 0, influencerCollabs: 0,
          contentProduction: 0, teamSalaries: 0, factoryRent: 0, logisticsAndShipping: 0,
          paymentGatewayFees: 0, fbaAndQuickCommerceFees: 0, rtoAndDamageCost: 0, softwareAndCloud: 0,
          legalAndInsurance: 0, travelAndAdmin: 0, depreciation: 0, interestAndFinance: 0, totalOpex: 0
        },
        ebitda: 0,
        ebitdaMarginPercent: 0,
        netProfit: 0,
        netMarginPercent: 0,
        isLocked: false
      };
      memoryStore.pnlEntries.unshift(newEntry);
      index = 0;
    }

    const entry = memoryStore.pnlEntries[index];

    if (revenue) {
      entry.revenue = {
        ...entry.revenue,
        ...revenue,
        totalRevenue: (revenue.d2c || 0) + (revenue.amazon || 0) + (revenue.blinkit || 0) + (revenue.b2b || 0) + (revenue.exports || 0)
      };
    }

    // Auto-calculate COGS from raw material receipts & production batches for this month
    const totalRMProcured = memoryStore.receipts.reduce((acc, r) => acc + (r.landedCostTotal || 0), 0);
    const totalLabour = memoryStore.batches.reduce((acc, b) => acc + (b.dehydration.labourCost || 0), 0);
    const totalPackaging = memoryStore.batches.reduce((acc, b) => acc + (b.packing.packagingCost || 0), 0);
    const utilities = 22500;

    entry.cogs = {
      rawMaterialProcurement: totalRMProcured || entry.cogs.rawMaterialProcurement,
      processingLabour: totalLabour || entry.cogs.processingLabour,
      packagingCost: totalPackaging || entry.cogs.packagingCost,
      factoryUtilities: utilities,
      totalCogs: (totalRMProcured || entry.cogs.rawMaterialProcurement) +
                 (totalLabour || entry.cogs.processingLabour) +
                 (totalPackaging || entry.cogs.packagingCost) + utilities
    };

    entry.grossProfit = entry.revenue.totalRevenue - entry.cogs.totalCogs;
    entry.grossMarginPercent = entry.revenue.totalRevenue > 0 ? parseFloat(((entry.grossProfit / entry.revenue.totalRevenue) * 100).toFixed(2)) : 0;

    if (fixedCosts) {
      entry.operatingExpenses = {
        ...entry.operatingExpenses,
        ...fixedCosts
      };
    }

    const opex = Object.entries(entry.operatingExpenses).reduce((acc, [key, val]) => {
      if (key !== 'totalOpex') return acc + Number(val || 0);
      return acc;
    }, 0);
    entry.operatingExpenses.totalOpex = opex;

    entry.ebitda = entry.grossProfit - opex + (entry.operatingExpenses.depreciation || 0);
    entry.ebitdaMarginPercent = entry.revenue.totalRevenue > 0 ? parseFloat(((entry.ebitda / entry.revenue.totalRevenue) * 100).toFixed(2)) : 0;
    entry.netProfit = entry.grossProfit - opex;
    entry.netMarginPercent = entry.revenue.totalRevenue > 0 ? parseFloat(((entry.netProfit / entry.revenue.totalRevenue) * 100).toFixed(2)) : 0;

    if (notes) entry.notes = notes;

    memoryStore.pnlEntries[index] = entry;
    return res.json(entry);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
