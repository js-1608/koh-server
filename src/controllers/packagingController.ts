import { Request, Response } from 'express';
import { memoryStore, IStorePackaging } from '../services/storeService';

// GET /api/packaging
export const getPackaging = async (req: Request, res: Response) => {
  try {
    const { country, status } = req.query;
    let list = [...memoryStore.packaging];

    if (country && typeof country === 'string') {
      list = list.filter(p => p.country.toLowerCase() === country.toLowerCase());
    }

    if (status && typeof status === 'string') {
      list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    list.sort((a, b) => (a.skuName || '').localeCompare(b.skuName || ''));

    const countries = Array.from(new Set(memoryStore.packaging.map(p => p.country)));

    res.json({
      success: true,
      data: list,
      meta: {
        countries,
        count: list.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/packaging
export const createPackaging = async (req: Request, res: Response) => {
  try {
    const { skuName, skuCode, country, packagingType, fssaiNumber, netWeight, regulatoryStandard, barcode, shelfLifeMonths, allergensDeclared, notes } = req.body;
    if (!skuName || !country) {
      return res.status(400).json({ success: false, message: 'skuName and country are required' });
    }

    const newPkg: IStorePackaging = {
      _id: 'pkg_' + Date.now(),
      skuName,
      skuCode: skuCode || 'KOH-' + Date.now().toString().slice(-4),
      country,
      version: 'v1.0',
      status: 'review',
      packagingType: packagingType || 'Standup Zipper Pouch',
      fssaiNumber: fssaiNumber || '13622014000345',
      netWeight: netWeight || '100g',
      regulatoryStandard: regulatoryStandard || 'FSSAI Standards',
      barcode: barcode || '890' + Math.floor(1000000000 + Math.random() * 9000000000),
      nutritionPanelVerified: true,
      allergensDeclared: allergensDeclared || 'None',
      shelfLifeMonths: Number(shelfLifeMonths) || 18,
      notes,
      updatedAt: new Date()
    };

    memoryStore.packaging.unshift(newPkg);
    res.status(201).json({ success: true, data: newPkg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/packaging/:id
export const updatePackaging = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = memoryStore.packaging.find(p => p._id === id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Packaging label not found' });
    }

    Object.assign(pkg, req.body, { updatedAt: new Date() });
    res.json({ success: true, data: pkg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/packaging/:id
export const deletePackaging = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.packaging.findIndex(p => p._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Packaging label not found' });
    }

    memoryStore.packaging.splice(idx, 1);
    res.json({ success: true, message: 'Packaging label removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
