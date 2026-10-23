import { Request, Response } from 'express';
import { memoryStore } from '../services/storeService';

export const getNpdProducts = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.npdProducts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createNpdProduct = async (req: Request, res: Response) => {
  try {
    const { title, concept, category, surplusCrop, originatingSignal, targetMrp, estimatedCogs } = req.body;

    const mrp = Number(targetMrp) || 249;
    const cogs = Number(estimatedCogs) || 75;
    const margin = mrp > 0 ? parseFloat((((mrp - cogs) / mrp) * 100).toFixed(2)) : 0;

    const newNpd = {
      _id: `npd_${Date.now()}`,
      title,
      concept,
      category: category || 'Superfood Blends',
      surplusCrop: surplusCrop || 'Raw Crop',
      originatingSignal: originatingSignal || 'Agri officer flagged harvest surplus.',
      stage: 'Surplus Signal' as const,
      demandValidation: {
        marketSizeEstimate: '₹15 Cr / year',
        competitorBrands: [],
        recommendedPriceRange: `₹${mrp - 50} - ₹${mrp}`,
        consumerTarget: 'Health enthusiasts',
        isApproved: false
      },
      labTrial: {
        formulationNotes: 'Initial trial recipe pending.',
        dehydrationTempC: 55,
        tasteScore: 8.0,
        textureScore: 8.0,
        yieldObservedPercent: 8.0,
        recipeLocked: false
      },
      commercialTrial: {
        trialYieldKg: 0,
        pilotPacksProduced: 0,
        compliancePassed: false
      },
      targetMrp: mrp,
      estimatedCogs: cogs,
      estimatedGrossMarginPercent: margin,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryStore.npdProducts.unshift(newNpd);
    return res.status(201).json(newNpd);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateNpdStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, stageData } = req.body;

    const index = memoryStore.npdProducts.findIndex(p => p._id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'NPD item not found' });
    }

    const item = memoryStore.npdProducts[index];
    if (stage) item.stage = stage;
    if (stageData) {
      if (stageData.demandValidation) item.demandValidation = { ...item.demandValidation, ...stageData.demandValidation };
      if (stageData.labTrial) item.labTrial = { ...item.labTrial, ...stageData.labTrial };
      if (stageData.commercialTrial) item.commercialTrial = { ...item.commercialTrial, ...stageData.commercialTrial };
    }
    item.updatedAt = new Date();

    memoryStore.npdProducts[index] = item;
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const promoteNpdToSku = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const npd = memoryStore.npdProducts.find(p => p._id === id);
    if (!npd) {
      return res.status(404).json({ error: 'NPD item not found' });
    }

    const skuCode = `KOH-${npd.title.slice(0, 3).toUpperCase()}-100G`;
    const newSku = {
      _id: `sku_${Date.now()}`,
      skuCode,
      name: npd.title,
      category: npd.category as any,
      produceSource: npd.surplusCrop,
      packWeightGm: 100,
      mrp: npd.targetMrp,
      sellingPrice: npd.targetMrp - 20,
      rawMaterialCost: npd.estimatedCogs * 0.5,
      labourCost: npd.estimatedCogs * 0.25,
      packagingCost: npd.estimatedCogs * 0.25,
      cogs: npd.estimatedCogs,
      grossMarginPercent: npd.estimatedGrossMarginPercent,
      currentStock: 100,
      reorderThreshold: 50,
      platforms: { amazon: true, blinkit: true, d2c: true, b2b: false },
      fssaiLicenseNumber: '13621014000321',
      status: 'active' as const
    };

    memoryStore.skus.unshift(newSku);
    npd.createdSkuCode = skuCode;
    npd.stage = 'Compliance & Launch';

    return res.json({ success: true, sku: newSku, npd });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
