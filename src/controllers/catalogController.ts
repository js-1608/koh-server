import { Request, Response } from 'express';
import { memoryStore } from '../services/storeService';

export const getSkus = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.skus);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createSku = async (req: Request, res: Response) => {
  try {
    const { name, category, produceSource, packWeightGm, mrp, sellingPrice, rawMaterialCost, labourCost, packagingCost, currentStock, platforms } = req.body;

    const rm = Number(rawMaterialCost) || 0;
    const lab = Number(labourCost) || 0;
    const pack = Number(packagingCost) || 0;
    const cogs = rm + lab + pack;
    const sp = Number(sellingPrice) || Number(mrp) || 100;
    const margin = sp > 0 ? parseFloat((((sp - cogs) / sp) * 100).toFixed(2)) : 0;

    const skuCode = `KOH-${(produceSource || 'SKU').toUpperCase().slice(0, 3)}-${packWeightGm || 100}G`;

    const newSku = {
      _id: `sku_${Date.now()}`,
      skuCode,
      name,
      category: category || 'Single Ingredient Powders',
      produceSource: produceSource || 'General Produce',
      packWeightGm: Number(packWeightGm) || 100,
      mrp: Number(mrp) || 299,
      sellingPrice: sp,
      rawMaterialCost: rm,
      labourCost: lab,
      packagingCost: pack,
      cogs,
      grossMarginPercent: margin,
      currentStock: Number(currentStock) || 0,
      reorderThreshold: 100,
      platforms: platforms || { amazon: true, blinkit: true, d2c: true, b2b: false, instamart: true, zepto: false },
      fssaiLicenseNumber: '13621014000321',
      status: 'active' as const
    };

    memoryStore.skus.unshift(newSku);
    return res.status(201).json(newSku);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateSku = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = memoryStore.skus.findIndex(s => s._id === id || s.skuCode === id);
    if (index === -1) {
      return res.status(404).json({ error: 'SKU not found' });
    }

    const sku = memoryStore.skus[index];
    Object.assign(sku, req.body);

    const rm = Number(sku.rawMaterialCost) || 0;
    const lab = Number(sku.labourCost) || 0;
    const pack = Number(sku.packagingCost) || 0;
    sku.cogs = rm + lab + pack;
    const sp = Number(sku.sellingPrice) || Number(sku.mrp) || 100;
    sku.grossMarginPercent = sp > 0 ? parseFloat((((sp - sku.cogs) / sp) * 100).toFixed(2)) : 0;

    memoryStore.skus[index] = sku;
    return res.json(sku);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getComplianceTests = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.complianceTests);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createComplianceTest = async (req: Request, res: Response) => {
  try {
    const { skuId, skuName, testType, labName, testDate, expiryDate, reportUrl, parameterResults, notes } = req.body;

    const newTest = {
      _id: `cmp_${Date.now()}`,
      skuId,
      skuName,
      testType: testType || 'FSSAI Nutritional',
      labName: labName || 'Eurofins Labs',
      testDate: new Date(testDate || Date.now()),
      expiryDate: new Date(expiryDate || Date.now() + 180 * 24 * 60 * 60 * 1000),
      retestFrequencyMonths: 6,
      reportUrl: reportUrl || 'https://drive.google.com/sample-report.pdf',
      status: 'valid' as const,
      parameterResults: parameterResults || [{ parameter: 'Moisture', value: '4.5%', standardLimit: '<6%', passed: true }],
      verifiedBy: 'QA Lead - Dr. Sharma',
      notes: notes || ''
    };

    memoryStore.complianceTests.unshift(newTest);
    return res.status(201).json(newTest);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
