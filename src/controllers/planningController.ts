import { Request, Response } from 'express';
import { memoryStore, saveStore } from '../services/storeService';

// Standard sales channels with their synced ROAS sources
export const SALES_CHANNELS = [
  { id: 'shopify', name: 'Shopify D2C', roasSource: 'meta' },
  { id: 'amazon_in', name: 'Amazon India', roasSource: 'amazon' },
  { id: 'amazon_uae', name: 'Amazon UAE', roasSource: 'amazon' },
  { id: 'bigbasket', name: 'BigBasket', roasSource: null },
  { id: 'b2b', name: 'B2B / Offline', roasSource: null },
];

export const DEFAULT_YIELD_PCT = 10; // Dehydration: 10kg fresh produce -> 1kg powder

// Standard active SKUs matching the demand scenario in command center & screenshot
const DEFAULT_PLANNING_SKUS = [
  { id: 'sku_amla_100', skuCode: 'KOH-AML-100', name: 'Amla Powder 100g', price: 249, packWeightGm: 100, unitCost: 95, currentStock: 310, reorderThreshold: 60, produceSource: 'Amla' },
  { id: 'sku_curry_100', skuCode: 'KOH-CUR-100', name: 'Curry Leaf Powder 100g', price: 225, packWeightGm: 100, unitCost: 150, currentStock: 42, reorderThreshold: 50, produceSource: 'Curry Leaf' },
  { id: 'sku_ginger_200', skuCode: 'KOH-ABC-200', name: 'ABC Ginger Mix 200g', price: 299, packWeightGm: 200, unitCost: 250, currentStock: 180, reorderThreshold: 40, produceSource: 'Beetroot' },
  { id: 'sku_pesarattu_250', skuCode: 'KOH-PES-250', name: 'Pesarattu Mix 250g', price: 199, packWeightGm: 250, unitCost: 78, currentStock: 260, reorderThreshold: 50, produceSource: 'Green Gram' },
  { id: 'sku_pancake_200', skuCode: 'KOH-PAN-200', name: 'Pancake Mix 200g', price: 229, packWeightGm: 200, unitCost: 82, currentStock: 95, reorderThreshold: 50, produceSource: 'Millet' }
];

// Helper to calculate historical channel ROAS
const getHistoricalChannelRoas = () => {
  return {
    meta: 1.01,
    amazon: 2.38,
    google: 2.10
  };
};

// Helper to get active SKU list (matching 5 core active SKUs from command center)
const getActiveSkuList = () => {
  return [...DEFAULT_PLANNING_SKUS];
};

// Compute demand requirements (raw materials and packaging)
export const computeDemandRequirements = (skuTargets: Record<string, number>, skus: any[]) => {
  const rawMaterial: Record<string, number> = {};
  const packaging = { pouches: {} as Record<string, number>, labels: {} as Record<string, number>, cartons: 0 };
  let totalUnits = 0;
  let totalFinishedKg = 0;

  Object.entries(skuTargets).forEach(([skuId, units]) => {
    const sku = skus.find(s => s.id === skuId || s.skuCode === skuId || s.name === skuId);
    if (!sku || !units || units <= 0) return;

    totalUnits += units;
    const packG = sku.packWeightGm || parseFloat((sku.name || '').match(/(\d+)\s*g/i)?.[1]) || 100;
    const finishedKg = (units * packG) / 1000;
    totalFinishedKg += finishedKg;

    // Map to crop
    let cropName = sku.produceSource || 'Other';
    if (!sku.produceSource) {
      const name = (sku.name || '').toLowerCase();
      if (name.includes('amla')) cropName = 'Amla';
      else if (name.includes('curry')) cropName = 'Curry Leaf';
      else if (name.includes('ginger') || name.includes('abc')) cropName = 'Beetroot';
      else if (name.includes('pesarattu')) cropName = 'Green Gram';
      else if (name.includes('pancake')) cropName = 'Millet';
      else if (name.includes('moringa')) cropName = 'Moringa';
    }

    const cropMaster = (memoryStore.cropMasters || []).find(c => c.cropName.toLowerCase() === cropName.toLowerCase());
    const yieldPct = cropMaster ? cropMaster.dehydrationYieldPercent : DEFAULT_YIELD_PCT;
    const rawKg = yieldPct > 0 ? (finishedKg / (yieldPct / 100)) : finishedKg * 10;

    rawMaterial[cropName] = (rawMaterial[cropName] || 0) + rawKg;

    // Packaging: 1 pouch/unit, 1 label/unit, 24 units/carton
    const pouchLabel = `${packG}g pouch`;
    packaging.pouches[pouchLabel] = (packaging.pouches[pouchLabel] || 0) + units;
    packaging.labels[`${sku.name} label`] = (packaging.labels[`${sku.name} label`] || 0) + units;
    packaging.cartons += Math.ceil(units / 24);
  });

  return { rawMaterial, packaging, totalUnits, totalFinishedKg };
};

// GET /api/planning/scenario
export const getPlanningScenario = async (req: Request, res: Response) => {
  try {
    const skus = getActiveSkuList();
    const roas = getHistoricalChannelRoas();

    const channelsWithRoas = SALES_CHANNELS.map(ch => ({
      ...ch,
      syncedRoas: ch.roasSource ? ((roas as Record<string, number>)[ch.roasSource] || 0) : 0
    }));

    if (!memoryStore.planningScenarios) memoryStore.planningScenarios = [];
    let saved = memoryStore.planningScenarios[0];

    if (!saved) {
      saved = {
        id: 'default',
        name: 'Q4 plan',
        period: '30',
        channelBudgets: {
          shopify: 50000,
          shopify_roas: 3.2,
          amazon_in: 30000,
          amazon_in_roas: 4.1,
          amazon_uae: 0,
          amazon_uae_roas: 2.38,
          bigbasket: 0,
          bigbasket_roas: '',
          b2b: 20000,
          b2b_roas: 5
        },
        skuMix: {},
        createdAt: Date.now()
      };
      memoryStore.planningScenarios.push(saved);
      saveStore();
    }

    const b2bOrders = (memoryStore.b2bOrders || []).map((o: any) => ({
      id: o._id,
      poNumber: o.poNumber || o.orderCode || o.id,
      date: o.orderDate || o.date || o.createdAt,
      totalAmount: o.totalAmount,
      lineItems: o.lineItems || []
    }));

    return res.json({
      scenario: saved,
      channels: channelsWithRoas,
      skus,
      b2bOrders,
      historicalRoas: roas
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/planning/scenario
export const savePlanningScenario = async (req: Request, res: Response) => {
  try {
    const { period, channelBudgets, skuMix, name } = req.body;

    if (!memoryStore.planningScenarios) memoryStore.planningScenarios = [];

    const scenario = {
      id: req.body.id || 'default',
      name: name || 'Current plan',
      period: String(period || 30),
      channelBudgets: channelBudgets || {},
      skuMix: skuMix || {},
      updatedAt: Date.now(),
      createdAt: req.body.createdAt || Date.now()
    };

    const existingIdx = memoryStore.planningScenarios.findIndex(s => s.id === scenario.id);
    if (existingIdx >= 0) {
      memoryStore.planningScenarios[existingIdx] = scenario;
    } else {
      memoryStore.planningScenarios.unshift(scenario);
    }

    saveStore();
    return res.json({ success: true, scenario });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/planning/plans
export const getDemandPlans = async (req: Request, res: Response) => {
  try {
    if (!memoryStore.demandPlans) memoryStore.demandPlans = [];
    const sorted = [...memoryStore.demandPlans].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return res.json(sorted);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/planning/plans
export const saveDemandPlan = async (req: Request, res: Response) => {
  try {
    const { id, period, periodLabel, skuTargets, status, productionStatus, procurementStatus } = req.body;
    const skus = getActiveSkuList();

    if (!memoryStore.demandPlans) memoryStore.demandPlans = [];

    const requirements = computeDemandRequirements(skuTargets || {}, skus);

    const planId = id || `dp_${Date.now()}`;
    const plan = {
      id: planId,
      period: period || 'monthly',
      periodLabel: periodLabel || 'Oct 2026',
      skuTargets: skuTargets || {},
      requirements,
      status: status || 'draft',
      productionStatus: productionStatus || (status === 'published' ? 'pending' : '—'),
      procurementStatus: procurementStatus || (status === 'published' ? 'pending' : '—'),
      publishedAt: status === 'published' ? (req.body.publishedAt || Date.now()) : undefined,
      createdAt: req.body.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    const existingIdx = memoryStore.demandPlans.findIndex(p => p.id === planId);
    if (existingIdx >= 0) {
      memoryStore.demandPlans[existingIdx] = plan;
    } else {
      memoryStore.demandPlans.unshift(plan);
    }

    saveStore();
    return res.json({ success: true, plan });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE /api/planning/plans/:id
export const deleteDemandPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!memoryStore.demandPlans) memoryStore.demandPlans = [];
    memoryStore.demandPlans = memoryStore.demandPlans.filter(p => p.id !== id);
    saveStore();
    return res.json({ success: true, message: 'Plan deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/planning/plans/:id/accept
export const acceptDemandPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dept } = req.body; // 'production' or 'procurement'

    if (!memoryStore.demandPlans) memoryStore.demandPlans = [];
    const plan = memoryStore.demandPlans.find(p => p.id === id);
    if (!plan) return res.status(404).json({ error: 'Demand plan not found' });

    let batchesCreated = 0;

    if (dept === 'production') {
      plan.productionStatus = 'accepted';
      // Create planned factory batches for each crop requirement
      if (plan.requirements?.rawMaterial) {
        Object.entries(plan.requirements.rawMaterial).forEach(([crop, rawKg]) => {
          const kg = Math.round(rawKg as number);
          if (kg <= 0) return;
          const countToday = (memoryStore.batches || []).length + 1;
          const batchCode = `DP-${crop.slice(0, 3).toUpperCase()}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(countToday).padStart(3, '0')}`;
          
          const newBatch: any = {
            _id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            batchCode,
            produce: crop,
            rmIds: [],
            currentStage: 'receiving',
            factoryStage: 'rm',
            batchStatus: 'open',
            date: new Date().toISOString().slice(0, 10),
            rawKg: kg,
            inputWeight: kg,
            notes: `Auto-generated from accepted Demand Plan: ${plan.periodLabel}`,
            sorting: { rawWeightKg: kg, sortedWeightKg: kg, rejectionWeightKg: 0, rejectionRatePercent: 0 },
            dehydration: { dryerId: 'D1', shift: 'Morning', inchargeName: 'Ramesh Kumar', cycleHours: 12, targetMoisturePercent: 5.5 },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          if (!memoryStore.batches) memoryStore.batches = [];
          memoryStore.batches.unshift(newBatch);
          batchesCreated++;
        });
      }
    } else if (dept === 'procurement') {
      plan.procurementStatus = 'accepted';
    }

    if (plan.productionStatus === 'accepted' && plan.procurementStatus === 'accepted') {
      plan.status = 'accepted';
    } else {
      plan.status = 'partially_accepted';
    }
    plan.updatedAt = Date.now();

    saveStore();
    return res.json({ success: true, plan, batchesCreated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/planning/plans/:id/reject
export const rejectDemandPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dept, reason } = req.body;

    if (!memoryStore.demandPlans) memoryStore.demandPlans = [];
    const plan = memoryStore.demandPlans.find(p => p.id === id);
    if (!plan) return res.status(404).json({ error: 'Demand plan not found' });

    if (dept === 'production') plan.productionStatus = 'rejected';
    if (dept === 'procurement') plan.procurementStatus = 'rejected';
    plan.status = 'rejected';
    plan.rejectionReason = reason || '';
    plan.updatedAt = Date.now();

    saveStore();
    return res.json({ success: true, plan });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/planning/ai-mix
export const getAIMixRecommendation = async (req: Request, res: Response) => {
  try {
    const skus = getActiveSkuList();
    const channels = SALES_CHANNELS;

    // Intelligent recommendation calculation based on margin, stock levels, and channel dynamics
    const mix: Record<string, Record<string, number>> = {};

    // Calculate margin and velocity weight per SKU
    const skuScores = skus.map(s => {
      const margin = s.price > 0 && s.unitCost > 0 ? ((s.price - s.unitCost) / s.price) * 100 : 60;
      const stockRunway = s.currentStock || 100;
      return {
        id: s.id,
        name: s.name,
        margin,
        stockRunway,
        score: margin * (stockRunway > 100 ? 1.2 : 0.8)
      };
    });

    const totalScore = skuScores.reduce((acc, s) => acc + s.score, 0);

    skus.forEach(s => {
      const scoreObj = skuScores.find(item => item.id === s.id);
      const relativeWeight = totalScore > 0 ? (scoreObj?.score || 1) / totalScore : 1 / skus.length;

      // Ad-driven channels (Shopify & Amazon IN) favor high-margin SKUs
      const adShare = Math.round(relativeWeight * 100);

      // B2B favors staple powders (Amla, Curry Leaf, Moringa)
      const isStaple = s.name.includes('Amla') || s.name.includes('Curry') || s.name.includes('Moringa');
      const b2bShare = isStaple ? Math.round(100 / 3) : Math.round(100 / (skus.length * 2));

      mix[s.id] = {
        shopify: adShare,
        amazon_in: adShare,
        amazon_uae: Math.round(100 / skus.length),
        bigbasket: Math.round(100 / skus.length),
        b2b: b2bShare
      };
    });

    // Normalize each channel to sum exactly 100%
    channels.forEach(ch => {
      let sum = 0;
      skus.forEach(s => { sum += mix[s.id][ch.id] || 0; });
      const diff = 100 - sum;
      if (diff !== 0 && skus.length > 0) {
        mix[skus[0].id][ch.id] = (mix[skus[0].id][ch.id] || 0) + diff;
      }
    });

    const rationale = `Recommended allocation gives priority to high-margin SKUs (Amla Powder & Pesarattu Mix at 60%+ margin) across high-ROAS ad channels (Meta & Amazon). Low-stock SKUs receive reduced ad push to prevent stockouts before next dehydration batch. B2B reflects institutional repeat buying.`;

    return res.json({ rationale, mix });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/planning/push-production
export const pushProductionPlan = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, deficits } = req.body;
    if (!deficits || !Array.isArray(deficits) || deficits.length === 0) {
      return res.status(400).json({ error: 'No deficits provided' });
    }

    const start = startDate || new Date().toISOString().slice(0, 10);
    const avgInputPerBatch = 50;
    let createdCount = 0;
    let day = 0;

    if (!memoryStore.batches) memoryStore.batches = [];

    deficits.forEach((d: any) => {
      const batchCount = Math.max(1, Math.ceil((d.deficitRawKg || 50) / avgInputPerBatch));
      for (let i = 0; i < batchCount; i++) {
        const batchDate = new Date(new Date(start).getTime() + day * 86400000).toISOString().slice(0, 10);
        if (endDate && batchDate > endDate) break;

        const inputKg = Math.min(avgInputPerBatch, Math.round(d.deficitRawKg - i * avgInputPerBatch));
        const countToday = memoryStore.batches.length + 1;
        const code = `PL-${(d.crop || 'PRD').slice(0, 3).toUpperCase()}-${batchDate.replace(/-/g, '')}-${String(countToday).padStart(3, '0')}`;

        const newBatch: any = {
          _id: `batch_pl_${Date.now()}_${i}`,
          batchCode: code,
          produce: d.crop || 'Amla',
          rmIds: [],
          currentStage: 'receiving',
          factoryStage: 'rm',
          batchStatus: 'open',
          date: batchDate,
          rawKg: inputKg,
          inputWeight: inputKg,
          plannedSku: d.skuName,
          shift: day % 2 === 0 ? 'Morning' : 'Afternoon',
          dryerNumber: i % 2 === 0 ? 'D1' : 'D2',
          notes: `Plan: ${d.skuName} deficit · ${batchDate}`,
          sorting: { rawWeightKg: inputKg, sortedWeightKg: inputKg, rejectionWeightKg: 0, rejectionRatePercent: 0 },
          dehydration: { dryerId: i % 2 === 0 ? 'D1' : 'D2', shift: day % 2 === 0 ? 'Morning' : 'Afternoon', inchargeName: 'Ramesh Kumar', cycleHours: 12, targetMoisturePercent: 5.5 },
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        memoryStore.batches.unshift(newBatch);
        createdCount++;
        if (i % 2 === 1) day++;
      }
      day++;
    });

    saveStore();
    return res.json({ success: true, count: createdCount, message: `${createdCount} production batches planned.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/planning/push-cultivation
export const pushCultivationPlan = async (req: Request, res: Response) => {
  try {
    const { cropPlans } = req.body;
    if (!cropPlans || !Array.isArray(cropPlans) || cropPlans.length === 0) {
      return res.status(400).json({ error: 'No crop plans provided' });
    }

    if (!memoryStore.cropCycles) memoryStore.cropCycles = [];
    let createdCount = 0;

    cropPlans.forEach((plan: any) => {
      const farmers = (memoryStore.farmers || []).filter(f => (f.crops || []).includes(plan.cropName) && f.status === 'active');
      if (farmers.length === 0) return;

      const acresPerFarmer = plan.acresNeeded / farmers.length;
      farmers.forEach(f => {
        const plot = (memoryStore.farmerPlots || []).find(p => p.farmerId === f._id);
        const cycleCode = `CYC-${plan.cropName.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(memoryStore.cropCycles.length + 1).padStart(3, '0')}`;

        const newCycle: any = {
          _id: `cyc_pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          cycleCode,
          farmerId: f._id,
          farmerName: f.name,
          cropId: plan.cropId || 'crop_1',
          cropName: plan.cropName,
          plotAcres: Math.max(0.5, Math.round(acresPerFarmer * 10) / 10),
          sowingDate: new Date(plan.sowBy || Date.now()),
          expectedHarvestDate: new Date(plan.harvestBy || Date.now() + 90 * 86400000),
          estimatedYieldKg: Math.round(Math.max(0.5, acresPerFarmer) * (plan.yieldPerAcre || 4000)),
          status: 'planned',
          farmPurchases: [],
          totalCultivationCost: Math.round(plan.estCost || 12000),
          notes: `From Cultivation Plan · ${plan.cropName} · ${Math.round(plan.rawKgNeeded || 0)}kg needed`
        };

        memoryStore.cropCycles.unshift(newCycle);
        createdCount++;
      });
    });

    saveStore();
    return res.json({ success: true, count: createdCount, message: `${createdCount} farmer crop cycles scheduled.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Legacy support for simulator endpoint
export const getPlanningScenarios = async (req: Request, res: Response) => {
  return getPlanningScenario(req, res);
};
