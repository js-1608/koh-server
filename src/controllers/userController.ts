import { Request, Response } from 'express';
import { memoryStore } from '../services/storeService';


export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const { module } = req.query;
    let list = memoryStore.activityLogs;
    if (module && module !== 'All') {
      list = list.filter(l => l.module.toLowerCase() === String(module).toLowerCase());
    }
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFounderDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalFarmers = memoryStore.farmers.length;
    const totalAcreage = memoryStore.farmers.reduce((acc, f) => acc + (f.plotAcres || 0), 0);
    const activeBatches = memoryStore.batches.filter(b => b.status === 'active').length;
    const currentMonthPnl = memoryStore.pnlEntries[0];
    const totalStockUnits = memoryStore.skus.reduce((acc, s) => acc + (s.currentStock || 0), 0);
    const lowStockSkus = memoryStore.skus.filter(s => s.currentStock <= s.reorderThreshold).length;
    const overdueReceipts = memoryStore.receipts.filter(r => r.paymentStatus === 'unpaid').length;
    const complianceAlerts = memoryStore.complianceTests.filter(c => c.status === 'expiring_soon' || c.status === 'expired').length;

    return res.json({
      revenue: currentMonthPnl?.revenue?.totalRevenue || 0,
      ebitda: currentMonthPnl?.ebitda || 0,
      ebitdaMargin: currentMonthPnl?.ebitdaMarginPercent || 0,
      grossMargin: currentMonthPnl?.grossMarginPercent || 0,
      procurement: {
        totalFarmers,
        totalAcreage,
        unpaidReceiptsCount: overdueReceipts
      },
      production: {
        activeBatches,
        totalStockUnits,
        lowStockSkus
      },
      marketing: {
        activePipelineCount: memoryStore.contentItems.length,
        collabsActive: memoryStore.influencers.filter(i => i.status === 'live' || i.status === 'contracted').length
      },
      npd: {
        activeConcepts: memoryStore.npdProducts.length
      },
      attentionItems: [
        { label: 'Unpaid Farmer Receipts', count: overdueReceipts, link: '/procurement', severity: 'medium' },
        { label: 'Low Stock SKUs (< Reorder)', count: lowStockSkus, link: '/catalog', severity: 'high' },
        { label: 'Compliance Retest Expiring', count: complianceAlerts, link: '/catalog', severity: 'high' },
        { label: 'Batches in Active Production', count: activeBatches, link: '/production', severity: 'low' }
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
