import { Request, Response } from 'express';
import { memoryStore } from '../services/storeService';

export const getFarmers = async (req: Request, res: Response) => {
  try {
    const { status, excludePaused, activeOnly } = req.query;
    let farmers = memoryStore.farmers || [];

    if (status) {
      farmers = farmers.filter(f => String(f.status).toLowerCase() === String(status).toLowerCase());
    } else if (excludePaused === 'true' || excludePaused === '1' || activeOnly === 'true') {
      farmers = farmers.filter(f => String(f.status).toLowerCase() !== 'paused');
    }

    return res.json(farmers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createFarmer = async (req: Request, res: Response) => {
  try {
    const {
      name,
      village,
      district,
      phone,
      plotAcres,
      crops,
      status,
      fpoLink,
      waterSource,
      waterAvailability,
      bankDetails,
      notes
    } = req.body;

    const count = (memoryStore.farmers || []).length + 14;
    const farmerCode = `FRM-${String(count).padStart(4, '0')}`;

    const newFarmer = {
      _id: `frm_${Date.now()}`,
      farmerCode,
      name: name || 'Farmer Partner',
      village: village || 'Hyderabad Area',
      district: district || 'Telangana',
      phone: phone || '+91 98000 00000',
      plotAcres: Number(plotAcres) || 1,
      crops: Array.isArray(crops) ? crops : crops ? [crops] : ['Amla'],
      status: (status || 'active') as 'active' | 'prospect' | 'paused',
      fpoLink: fpoLink || '',
      waterSource: waterSource || 'Borewell',
      waterAvailability: waterAvailability || 'Year-round',
      bankDetails: bankDetails || {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
      },
      notes: notes || '',
      createdAt: new Date()
    };

    if (!memoryStore.farmers) memoryStore.farmers = [];
    memoryStore.farmers.unshift(newFarmer);
    return res.status(201).json(newFarmer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateFarmer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      village,
      district,
      phone,
      plotAcres,
      crops,
      status,
      fpoLink,
      waterSource,
      waterAvailability,
      bankDetails,
      notes
    } = req.body;

    const farmer = (memoryStore.farmers || []).find(f => f._id === id || f.farmerCode === id);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    if (name !== undefined) farmer.name = name;
    if (village !== undefined) farmer.village = village;
    if (district !== undefined) farmer.district = district;
    if (phone !== undefined) farmer.phone = phone;
    if (plotAcres !== undefined) farmer.plotAcres = Number(plotAcres);
    if (crops !== undefined) farmer.crops = Array.isArray(crops) ? crops : [crops];
    if (status !== undefined) farmer.status = status;
    if (fpoLink !== undefined) farmer.fpoLink = fpoLink;
    if (waterSource !== undefined) farmer.waterSource = waterSource;
    if (waterAvailability !== undefined) farmer.waterAvailability = waterAvailability;
    if (bankDetails !== undefined) farmer.bankDetails = bankDetails;
    if (notes !== undefined) farmer.notes = notes;
    farmer.updatedAt = new Date();

    return res.json(farmer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteFarmer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.farmers.findIndex(f => f._id === id || f.farmerCode === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    const removed = memoryStore.farmers.splice(idx, 1)[0];
    return res.json({ success: true, message: `Farmer ${removed.name} removed.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCropMasters = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.cropMasters);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCropMaster = async (req: Request, res: Response) => {
  try {
    const {
      cropName,
      category,
      daysToHarvest,
      freshYieldPerAcreKg,
      dehydrationYieldPercent,
      costPerAcreBreakdown,
      marketRatePerKg
    } = req.body;

    if (!cropName) {
      return res.status(400).json({ error: 'Crop name is required' });
    }

    const breakdown = costPerAcreBreakdown || { seeds: 4000, inputs: 5000, labour: 7000, transport: 2500 };
    const totalCost = Number(breakdown.seeds || 0) + Number(breakdown.inputs || 0) + Number(breakdown.labour || 0) + Number(breakdown.transport || 0);

    const newCrop = {
      _id: `crp_${Date.now()}`,
      cropName: cropName.trim(),
      category: category || 'Vegetable',
      daysToHarvest: Number(daysToHarvest) || 90,
      freshYieldPerAcreKg: Number(freshYieldPerAcreKg) || 4000,
      dehydrationYieldPercent: Number(dehydrationYieldPercent) || 8.0,
      costPerAcreBreakdown: breakdown,
      totalEstimatedCostPerAcre: totalCost || 18500,
      marketRatePerKg: Number(marketRatePerKg) || 30
    };

    memoryStore.cropMasters.push(newCrop);
    return res.status(201).json(newCrop);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCropMaster = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const crop = memoryStore.cropMasters.find(c => c._id === id || c.cropName.toLowerCase() === id.toLowerCase());
    if (!crop) {
      return res.status(404).json({ error: 'Crop master not found' });
    }

    const {
      cropName,
      category,
      daysToHarvest,
      freshYieldPerAcreKg,
      dehydrationYieldPercent,
      costPerAcreBreakdown,
      marketRatePerKg
    } = req.body;

    if (cropName) crop.cropName = cropName;
    if (category) crop.category = category;
    if (daysToHarvest !== undefined) crop.daysToHarvest = Number(daysToHarvest);
    if (freshYieldPerAcreKg !== undefined) crop.freshYieldPerAcreKg = Number(freshYieldPerAcreKg);
    if (dehydrationYieldPercent !== undefined) crop.dehydrationYieldPercent = Number(dehydrationYieldPercent);
    if (costPerAcreBreakdown) {
      crop.costPerAcreBreakdown = costPerAcreBreakdown;
      crop.totalEstimatedCostPerAcre = Number(costPerAcreBreakdown.seeds || 0) +
                                      Number(costPerAcreBreakdown.inputs || 0) +
                                      Number(costPerAcreBreakdown.labour || 0) +
                                      Number(costPerAcreBreakdown.transport || 0);
    }
    if (marketRatePerKg !== undefined) crop.marketRatePerKg = Number(marketRatePerKg);

    return res.json(crop);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCropCycles = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.cropCycles);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCropCycle = async (req: Request, res: Response) => {
  try {
    const { farmerId, cropId, plotAcres, sowingDate, notes } = req.body;

    const farmer = memoryStore.farmers.find(f => f._id === farmerId || f.farmerCode === farmerId);
    const crop = memoryStore.cropMasters.find(c => c._id === cropId || c.cropName === cropId);

    const sowing = new Date(sowingDate || Date.now());
    const days = crop ? crop.daysToHarvest : 90;
    const expectedHarvest = new Date(sowing.getTime() + days * 24 * 60 * 60 * 1000);
    const acres = Number(plotAcres) || 1;
    const estYield = crop ? crop.freshYieldPerAcreKg * acres : 4000 * acres;

    const cycleCode = `CYC-${new Date().getFullYear()}-${String(memoryStore.cropCycles.length + 1).padStart(3, '0')}`;

    const newCycle = {
      _id: `cyc_${Date.now()}`,
      cycleCode,
      farmerId: farmer ? farmer._id : farmerId,
      farmerName: farmer ? farmer.name : 'Farmer Partner',
      cropId: crop ? crop._id : cropId,
      cropName: crop ? crop.cropName : 'Custom Produce',
      plotAcres: acres,
      sowingDate: sowing,
      expectedHarvestDate: expectedHarvest,
      estimatedYieldKg: estYield,
      actualYieldKg: 0,
      status: 'growing' as const,
      farmPurchases: [],
      totalCultivationCost: crop ? crop.totalEstimatedCostPerAcre * acres : 20000 * acres,
      notes: notes || ''
    };

    memoryStore.cropCycles.unshift(newCycle);
    return res.status(201).json(newCycle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCropCycle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actualHarvestDate, actualYieldKg, notes } = req.body;

    const cycle = memoryStore.cropCycles.find(c => c._id === id || c.cycleCode === id);
    if (!cycle) {
      return res.status(404).json({ error: 'Crop cycle not found' });
    }

    if (status) cycle.status = status;
    if (actualHarvestDate) cycle.actualHarvestDate = new Date(actualHarvestDate);
    if (actualYieldKg !== undefined) cycle.actualYieldKg = Number(actualYieldKg);
    if (notes !== undefined) cycle.notes = notes;

    return res.json(cycle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addCyclePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { item, category, amount } = req.body;

    const cycle = memoryStore.cropCycles.find(c => c._id === id || c.cycleCode === id);
    if (!cycle) {
      return res.status(404).json({ error: 'Crop cycle not found' });
    }

    const purchase = {
      item,
      category,
      amount: Number(amount) || 0,
      date: new Date()
    };

    cycle.farmPurchases.push(purchase);
    cycle.totalCultivationCost += purchase.amount;

    return res.json(cycle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Farm Partners / FPOs Controllers
// ==========================================
export const getFarmPartners = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.farmPartners || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createFarmPartner = async (req: Request, res: Response) => {
  try {
    const { name, type, contact, location, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Partner name is required' });

    const newPartner = {
      _id: `part_${Date.now()}`,
      name: name.trim(),
      type: type || 'FPO',
      contact: contact || '',
      location: location || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!memoryStore.farmPartners) memoryStore.farmPartners = [];
    memoryStore.farmPartners.unshift(newPartner);
    return res.status(201).json(newPartner);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateFarmPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = (memoryStore.farmPartners || []).find(p => p._id === id);
    if (!partner) return res.status(404).json({ error: 'Partner not found' });

    const { name, type, contact, location, notes } = req.body;
    if (name) partner.name = name.trim();
    if (type) partner.type = type;
    if (contact !== undefined) partner.contact = contact;
    if (location !== undefined) partner.location = location;
    if (notes !== undefined) partner.notes = notes;
    partner.updatedAt = new Date();

    return res.json(partner);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteFarmPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = (memoryStore.farmPartners || []).findIndex(p => p._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Partner not found' });
    const removed = memoryStore.farmPartners.splice(idx, 1)[0];
    return res.json({ success: true, message: `Partner ${removed.name} removed.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Farmer Plots Controllers
// ==========================================
export const getFarmerPlots = async (req: Request, res: Response) => {
  try {
    const { farmerId } = req.query;
    let plots = memoryStore.farmerPlots || [];
    if (farmerId) plots = plots.filter(p => p.farmerId === farmerId);
    return res.json(plots);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createFarmerPlot = async (req: Request, res: Response) => {
  try {
    const { farmerId, name, acres, soilType, irrigation } = req.body;
    if (!farmerId || !name) return res.status(400).json({ error: 'Farmer ID and Plot Name are required' });

    const newPlot = {
      _id: `plt_${Date.now()}`,
      farmerId,
      name: name.trim(),
      acres: Number(acres) || 1,
      soilType: soilType || 'Red soil',
      irrigation: irrigation || 'Drip',
      createdAt: new Date()
    };

    if (!memoryStore.farmerPlots) memoryStore.farmerPlots = [];
    memoryStore.farmerPlots.push(newPlot);
    return res.status(201).json(newPlot);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteFarmerPlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = (memoryStore.farmerPlots || []).findIndex(p => p._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Plot not found' });
    memoryStore.farmerPlots.splice(idx, 1);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Soil & Water Tests Controllers
// ==========================================
export const getSoilWaterTests = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.soilWaterTests || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createSoilWaterTest = async (req: Request, res: Response) => {
  try {
    const { farmerId, testType, plotId, date, lab, results, notes } = req.body;
    if (!farmerId) return res.status(400).json({ error: 'Farmer ID is required' });

    const newTest = {
      _id: `test_${Date.now()}`,
      farmerId,
      testType: testType || 'soil',
      plotId: plotId || '',
      date: date || new Date().toISOString().slice(0, 10),
      lab: lab || 'Certified Agricultural Lab',
      results: results || {},
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!memoryStore.soilWaterTests) memoryStore.soilWaterTests = [];
    memoryStore.soilWaterTests.unshift(newTest);
    return res.status(201).json(newTest);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteSoilWaterTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = (memoryStore.soilWaterTests || []).findIndex(t => t._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Test not found' });
    memoryStore.soilWaterTests.splice(idx, 1);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Farm Activity Log Controllers
// ==========================================
export const getFarmActivities = async (req: Request, res: Response) => {
  try {
    const { farmerId, activityType } = req.query;
    let activities = memoryStore.farmActivities || [];
    if (farmerId) activities = activities.filter(a => a.farmerId === farmerId);
    if (activityType) activities = activities.filter(a => a.activityType === activityType);
    return res.json(activities);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createFarmActivity = async (req: Request, res: Response) => {
  try {
    const {
      farmerId,
      cycleId,
      plotId,
      activityType,
      date,
      description,
      product,
      qty,
      unit,
      cost,
      variety,
      cycleStage,
      remarks,
      media,
      flagContent,
      crop,
      notes
    } = req.body;

    if (!farmerId) return res.status(400).json({ error: 'Farmer ID is required' });

    const newActivity = {
      _id: `act_${Date.now()}`,
      farmerId,
      cycleId: cycleId || '',
      plotId: plotId || '',
      activityType: activityType || 'soil_prep',
      date: date || new Date().toISOString().slice(0, 10),
      description: description || remarks || 'Field activity logged',
      product: product || '',
      qty: qty || '',
      unit: unit || '',
      cost: Number(cost) || 0,
      variety: variety || '',
      cycleStage: cycleStage || '',
      remarks: remarks || '',
      media: media || [],
      flagContent: Boolean(flagContent),
      crop: crop || '',
      notes: notes || remarks || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!memoryStore.farmActivities) memoryStore.farmActivities = [];
    memoryStore.farmActivities.unshift(newActivity);
    return res.status(201).json(newActivity);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteFarmActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = (memoryStore.farmActivities || []).findIndex(a => a._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Activity not found' });
    memoryStore.farmActivities.splice(idx, 1);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Crop Diagnoses Controllers
// ==========================================
export const getCropDiagnoses = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.cropDiagnoses || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCropDiagnosis = async (req: Request, res: Response) => {
  try {
    const { farmerId, crop, stage, symptoms, photoUrl, diagnosis } = req.body;
    const newDiag = {
      _id: `diag_${Date.now()}`,
      farmerId: farmerId || '',
      crop: crop || 'General Crop',
      stage: stage || 'Growing',
      symptoms: symptoms || '',
      photoUrl: photoUrl || '',
      diagnosis: diagnosis || 'Organic treatment recommendation generated.',
      createdAt: new Date()
    };

    if (!memoryStore.cropDiagnoses) memoryStore.cropDiagnoses = [];
    memoryStore.cropDiagnoses.unshift(newDiag);
    return res.status(201).json(newDiag);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

