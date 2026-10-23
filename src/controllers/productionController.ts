import { Request, Response } from 'express';
import { memoryStore, saveStore } from '../services/storeService';
import { RawMaterialReceipt } from '../models/RawMaterialReceipt';
import { ProductionBatch } from '../models/ProductionBatch';

export const getProductionStats = async (req: Request, res: Response) => {
  try {
    const produceFilter = req.query.produce as string;

    let receipts = memoryStore.receipts;
    let batches = memoryStore.batches;

    if (produceFilter && produceFilter !== 'All') {
      receipts = receipts.filter(r => r.produce.toLowerCase().includes(produceFilter.toLowerCase()));
      batches = batches.filter(b => b.produce.toLowerCase().includes(produceFilter.toLowerCase()));
    }

    const awaitingSorting = receipts.filter(r => r.status === 'received' && !r.batchCode).length;
    const dehydrationOpen = batches.filter(b => b.currentStage === 'dehydration' && b.status === 'active' && !b.dispatch?.dispatched).length;
    const awaitingPowdering = batches.filter(b => (b.currentStage === 'powdering' || (b.dehydration?.postDryWeightKg && b.dehydration.postDryWeightKg > 0)) && !b.powdering?.isPowdered && b.status === 'active').length;
    const readyToPack = batches.filter(b => (b.powdering?.isPowdered === true && (b.powdering?.powderedWeightKg || b.totalFinishedKg || 0) > 0) && (!b.packing?.totalPacksProduced || b.packing.totalPacksProduced === 0) && b.status === 'active').length;
    const awaitingDispatch = batches.filter(b => (b.currentStage === 'dispatch' || (b.packing?.totalPacksProduced > 0 && b.powdering?.isPowdered)) && b.dispatch?.status !== 'delivered' && !b.dispatch?.dispatched && b.currentStage !== 'completed').length;

    return res.json({
      awaitingSorting,
      dehydrationOpen,
      awaitingPowdering,
      readyToPack,
      awaitingDispatch,
      totalBatches: batches.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const produce = req.query.produce as string;
    let list = memoryStore.receipts;
    if (produce && produce !== 'All') {
      list = list.filter(r => r.produce.toLowerCase().includes(produce.toLowerCase()));
    }
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createReceipt = async (req: Request, res: Response) => {
  try {
    const { farmerId, produce, initialWeightKg, farmLocation, modeOfTransport, transportCost, ratePerKg, vehicleNumber, notes } = req.body;

    const farmer = memoryStore.farmers.find(f => f._id === farmerId || f.name.toLowerCase() === (req.body.farmerName || '').toLowerCase());
    const farmerName = farmer ? farmer.name : (req.body.farmerName || 'Unknown Farmer');
    const farmerCode = farmer?.farmerCode || req.body.farmerCode || 'FRM-0001';
    const farmerPhone = farmer?.phone || req.body.farmerPhone || '';
    const location = farmLocation || (farmer ? [farmer.village, farmer.district].filter(Boolean).join(', ') : 'Telangana');

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = memoryStore.receipts.filter(r => r.rmId.startsWith(`RM-${todayStr}`)).length + 1;
    const rmId = `RM-${todayStr}-${String(countToday).padStart(4, '0')}`;

    const weight = Number(initialWeightKg) || 0;
    const rate = Number(ratePerKg) || 35;
    const trans = Number(transportCost) || 0;
    const totalProduceCost = weight * rate;
    const landedCostTotal = totalProduceCost + trans;
    const landedCostPerKg = weight > 0 ? parseFloat((landedCostTotal / weight).toFixed(2)) : rate;

    const newReceipt = {
      _id: `rcp_${Date.now()}`,
      rmId,
      farmerId: farmer ? farmer._id : 'frm_custom',
      farmerCode,
      farmerName,
      farmerPhone,
      produce: produce || 'General Produce',
      initialWeightKg: weight,
      receiptDate: new Date(),
      farmLocation: location,
      modeOfTransport: modeOfTransport || 'Mini Truck',
      vehicleNumber: vehicleNumber || 'TS 08 UB 4120',
      transportCost: trans,
      ratePerKg: rate,
      totalProduceCost,
      landedCostTotal,
      landedCostPerKg,
      paymentStatus: 'unpaid' as const,
      status: 'received' as const,
      notes: notes || '',
      gatePassNo: `GP-${todayStr}-${String(countToday).padStart(3, '0')}`,
      weighbridgeSlipNo: `WB-${String(Math.floor(1000 + Math.random() * 9000))}`
    };

    memoryStore.receipts.unshift(newReceipt);

    // Add activity log
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Procurement',
      action: 'create',
      title: 'Raw Material Delivery Logged',
      description: `Logged ${weight} kg ${produce} from ${farmerName} (${rmId})`,
      entityId: rmId,
      userName: req.body.userName || 'Shivam Singh',
      timestamp: new Date()
    });

    return res.status(201).json(newReceipt);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { modeOfTransport, transportCost, ratePerKg, vehicleNumber, paymentStatus, notes } = req.body;

    const index = memoryStore.receipts.findIndex(r => r._id === id || r.rmId === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const receipt = memoryStore.receipts[index];
    if (modeOfTransport !== undefined) receipt.modeOfTransport = modeOfTransport;
    if (vehicleNumber !== undefined) (receipt as any).vehicleNumber = vehicleNumber;
    if (ratePerKg !== undefined) {
      receipt.ratePerKg = Number(ratePerKg);
      receipt.totalProduceCost = receipt.initialWeightKg * receipt.ratePerKg;
    }
    if (transportCost !== undefined) {
      receipt.transportCost = Number(transportCost);
    }
    
    // Recalculate landed costs
    receipt.totalProduceCost = (receipt.initialWeightKg || 0) * (receipt.ratePerKg || 35);
    receipt.landedCostTotal = receipt.totalProduceCost + (receipt.transportCost || 0);
    receipt.landedCostPerKg = receipt.initialWeightKg > 0 ? parseFloat((receipt.landedCostTotal / receipt.initialWeightKg).toFixed(2)) : 0;

    if (paymentStatus !== undefined) receipt.paymentStatus = paymentStatus;
    if (notes !== undefined) receipt.notes = notes;

    memoryStore.receipts[index] = receipt;
    return res.json(receipt);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBatches = async (req: Request, res: Response) => {
  try {
    const { stage, produce, status } = req.query;
    let list = memoryStore.batches;

    if (stage && stage !== 'all') {
      list = list.filter(b => b.currentStage === stage);
    }
    if (produce && produce !== 'All') {
      list = list.filter(b => b.produce.toLowerCase().includes(String(produce).toLowerCase()));
    }
    if (status) {
      list = list.filter(b => b.status === status);
    }

    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const { rmIds, produce, notes } = req.body;

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = memoryStore.batches.length + 1;
    const batchCode = `BC-${todayStr}-${String(countToday).padStart(2, '0')}`;

    // Sum weights from linked RM receipts
    let totalRawKg = 0;
    const selectedRmIds = Array.isArray(rmIds) ? rmIds : [rmIds];
    selectedRmIds.forEach(rmId => {
      const rec = memoryStore.receipts.find(r => r.rmId === rmId || r._id === rmId);
      if (rec) {
        totalRawKg += rec.initialWeightKg;
        rec.status = 'in_batch';
        rec.batchCode = batchCode;
      }
    });

    const newBatch = {
      _id: `btc_${Date.now()}`,
      batchCode,
      produce: produce || (selectedRmIds.length ? 'Amla' : 'General Produce'),
      rmIds: selectedRmIds,
      currentStage: 'sorting' as const,
      sorting: {
        rawWeightKg: totalRawKg,
        sortedWeightKg: totalRawKg,
        rejectionWeightKg: 0,
        rejectionRatePercent: 0,
        notes: notes || ''
      },
      dehydration: {
        dryerId: 'Dryer A1',
        shift: 'Morning (6am-2pm)' as const,
        tempC: 58,
        fanSpeed: 'Level 4 (High)',
        preProcessSteps: ['Washing', 'Slicing 4mm'],
        preDryWeightKg: totalRawKg,
        postDryWeightKg: 0,
        yieldPercent: 0,
        labourCost: 0,
        utilityCost: 0
      },
      powdering: {
        isPowdered: false,
        preSievedWeightKg: 0,
        powderedWeightKg: 0,
        meshSize: '80 Mesh',
        lossWeightKg: 0
      },
      packing: {
        outputId: '',
        skuName: '',
        packWeightGm: 100,
        channel: 'B2C (Retail/D2C)' as const,
        totalPacksProduced: 0,
        totalFinishedKg: 0,
        packagingCost: 0,
        lotNumber: `LOT-${todayStr.slice(2, 6)}`,
        bestBefore: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      dispatch: {
        destination: '',
        qualitySignOff: false,
        status: 'pending_qc' as const,
        dispatchedPacks: 0
      },
      totalRawKg,
      totalFinishedKg: 0,
      totalBatchCost: 0,
      status: 'active' as const,
      createdAt: new Date()
    };

    memoryStore.batches.unshift(newBatch);
    return res.status(201).json(newBatch);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBatchStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, stageData, moveToNextStage } = req.body;

    const index = memoryStore.batches.findIndex(b => b._id === id || b.batchCode === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const batch = memoryStore.batches[index];

    if (stage === 'sorting' && stageData) {
      const raw = Number(stageData.rawWeightKg || batch.sorting.rawWeightKg || batch.totalRawKg);
      const sorted = Number(stageData.sortedWeightKg) || 0;
      const rejection = raw - sorted;
      const rejectionPct = raw > 0 ? parseFloat(((rejection / raw) * 100).toFixed(2)) : 0;

      batch.sorting = {
        ...batch.sorting,
        ...stageData,
        rawWeightKg: raw,
        sortedWeightKg: sorted,
        rejectionWeightKg: rejection,
        rejectionRatePercent: rejectionPct,
        sortedAt: new Date()
      };
      batch.dehydration.preDryWeightKg = sorted;
      if (moveToNextStage) batch.currentStage = 'dehydration';
    } else if (stage === 'dehydration' && stageData) {
      const preDry = Number(stageData.preDryWeightKg || batch.dehydration.preDryWeightKg);
      const postDry = Number(stageData.postDryWeightKg) || 0;
      const yieldPct = preDry > 0 ? parseFloat(((postDry / preDry) * 100).toFixed(2)) : 0;

      batch.dehydration = {
        ...batch.dehydration,
        ...stageData,
        preDryWeightKg: preDry,
        postDryWeightKg: postDry,
        yieldPercent: yieldPct,
        labourCost: Number(stageData.labourCost) || 0,
        completedAt: new Date()
      };
      batch.totalFinishedKg = postDry;
      batch.powdering.preSievedWeightKg = postDry;
      if (moveToNextStage) batch.currentStage = 'powdering';
    } else if (stage === 'powdering' && stageData) {
      const isPowdered = stageData.isPowdered !== false;
      const preSieved = Number(stageData.preSievedWeightKg || batch.powdering.preSievedWeightKg);
      const powdered = isPowdered ? (Number(stageData.powderedWeightKg) || preSieved) : preSieved;
      const loss = isPowdered ? Math.max(0, preSieved - powdered) : 0;

      batch.powdering = {
        ...batch.powdering,
        ...stageData,
        isPowdered,
        preSievedWeightKg: preSieved,
        powderedWeightKg: powdered,
        lossWeightKg: parseFloat(loss.toFixed(2)),
        powderedAt: new Date()
      };
      batch.totalFinishedKg = powdered;
      if (moveToNextStage) batch.currentStage = 'packing';
    } else if (stage === 'packing' && stageData) {
      const packWeightGm = Number(stageData.packWeightGm) || 100;
      const totalFinishedKg = batch.totalFinishedKg || Number(stageData.totalFinishedKg) || 10;
      const totalPacks = Math.floor((totalFinishedKg * 1000) / packWeightGm);
      const packagingCost = Number(stageData.packagingCost) || 0;
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const outputId = stageData.outputId || `OP-${todayStr}-${String(index + 1).padStart(2, '0')}`;

      batch.packing = {
        ...batch.packing,
        ...stageData,
        outputId,
        packWeightGm,
        totalPacksProduced: totalPacks,
        totalFinishedKg,
        packagingCost,
        packedAt: new Date()
      };
      batch.dispatch.dispatchedPacks = totalPacks;
      if (moveToNextStage) batch.currentStage = 'dispatch';
    } else if (stage === 'dispatch' && stageData) {
      const chosenChannel = stageData.channel || batch.dispatch?.channel || batch.packing?.channel || 'B2C (Retail / D2C)';
      const chosenDestination = stageData.destination || batch.dispatch?.destination || 'D2C Central Fulfillment Center (Shiprocket Hub)';

      batch.dispatch = {
        ...batch.dispatch,
        ...stageData,
        channel: chosenChannel,
        destination: chosenDestination,
        dispatchDate: new Date()
      };
      if (batch.packing) {
        batch.packing.channel = chosenChannel;
      }
      if (stageData.qualitySignOff) {
        batch.dispatch.status = 'qc_approved';
      }
      if (stageData.dispatched || moveToNextStage) {
        batch.dispatch.status = 'delivered';
        batch.currentStage = 'completed';
        batch.status = 'completed';
      }

      // Sync to linked package in memoryStore.packages if exists
      if (batch.packing?.outputId && memoryStore.packages) {
        const linkedPkg = memoryStore.packages.find(p => p.outputId === batch.packing?.outputId);
        if (linkedPkg) {
          linkedPkg.channel = chosenChannel;
          linkedPkg.dispatch.destination = chosenDestination;
          if (stageData.vehicleNo) linkedPkg.dispatch.vehicleNo = stageData.vehicleNo;
          if (stageData.qcInspector) linkedPkg.dispatch.qcInspector = stageData.qcInspector;
          linkedPkg.dispatch.status = 'delivered';
          linkedPkg.dispatch.dispatchDate = new Date();
        }
      }
    }

    memoryStore.batches[index] = batch;

    // Log activity
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Production',
      action: 'stage_change',
      title: `Batch Stage Updated: ${batch.batchCode}`,
      description: `Batch ${batch.batchCode} moved to stage [${batch.currentStage}].`,
      entityId: batch.batchCode,
      userName: req.body.userName || 'Factory Supervisor',
      timestamp: new Date()
    });

    return res.json(batch);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getInventory = async (req: Request, res: Response) => {
  try {
    const rawProduce = memoryStore.receipts.filter(r => r.status === 'received');
    const inProcess = memoryStore.batches.filter(b => b.status === 'active' && b.currentStage !== 'completed');
    const finishedSkus = memoryStore.skus;

    return res.json({
      rawProduceStock: rawProduce,
      inProcessBatches: inProcess,
      finishedSkus: finishedSkus
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// EQUIPMENT ENDPOINTS
// ==========================================
export const getEquipment = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.equipment || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { name, category, status, powerKw, capacityPerHrKg, tempC, airflowLevel, healthScorePercent, activeLoadKg, currentBatch, notes } = req.body;
    const count = (memoryStore.equipment || []).length + 1;
    const code = req.body.code || `EQ-00${count}`;

    const newEquip = {
      _id: `eq_${Date.now()}`,
      code,
      name: name || 'Factory Machinery',
      category: category || 'General Machinery',
      status: (status || 'active') as any,
      powerKw: Number(powerKw) || 15,
      capacityPerHrKg: Number(capacityPerHrKg) || 200,
      tempC: tempC !== undefined ? Number(tempC) : 55,
      airflowLevel: airflowLevel !== undefined ? Number(airflowLevel) : 4,
      healthScorePercent: Number(healthScorePercent) || 95,
      activeLoadKg: Number(activeLoadKg) || 0,
      currentBatch: currentBatch || '',
      notes: notes || '',
      updatedAt: new Date()
    };

    if (!memoryStore.equipment) memoryStore.equipment = [];
    memoryStore.equipment.unshift(newEquip);
    return res.status(201).json(newEquip);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const equip = (memoryStore.equipment || []).find(e => e._id === id || e.code === id);
    if (!equip) return res.status(404).json({ error: 'Equipment not found' });

    Object.assign(equip, req.body, { updatedAt: new Date() });
    return res.json(equip);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// CROP PROCESSING ENDPOINTS
// ==========================================
export const getCropProcessing = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.cropProcessing || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCropProcessing = async (req: Request, res: Response) => {
  try {
    const newCropProc = {
      _id: `cp_${Date.now()}`,
      cropName: req.body.cropName || 'Custom Produce',
      washTimeMin: Number(req.body.washTimeMin) || 10,
      sliceThicknessMm: req.body.sliceThicknessMm || '3mm Slice',
      blanchingTempC: Number(req.body.blanchingTempC) || 80,
      dehydrationTempC: Number(req.body.dehydrationTempC) || 58,
      dehydrationDurationHours: Number(req.body.dehydrationDurationHours) || 12,
      targetMoisturePercent: Number(req.body.targetMoisturePercent) || 4.5,
      yieldPercent: Number(req.body.yieldPercent) || 8.0,
      millingMeshSize: req.body.millingMeshSize || '80 Mesh Standard',
      laborHoursPerTon: Number(req.body.laborHoursPerTon) || 16,
      notes: req.body.notes || ''
    };
    if (!memoryStore.cropProcessing) memoryStore.cropProcessing = [];
    memoryStore.cropProcessing.unshift(newCropProc);
    return res.status(201).json(newCropProc);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCropProcessing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cp = (memoryStore.cropProcessing || []).find(c => c._id === id || c.cropName.toLowerCase() === id.toLowerCase());
    if (!cp) return res.status(404).json({ error: 'Crop processing parameters not found' });

    Object.assign(cp, req.body);
    return res.json(cp);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// SHIFT SCHEDULE ENDPOINTS
// ==========================================
export const getShiftSchedules = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.shiftSchedules || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createShiftSchedule = async (req: Request, res: Response) => {
  try {
    const count = (memoryStore.shiftSchedules || []).length + 1;
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newShift = {
      _id: `sh_${Date.now()}`,
      shiftCode: req.body.shiftCode || `SHF-${todayStr}-${count}`,
      shiftName: req.body.shiftName || 'Shift A (Morning)',
      shiftDate: req.body.shiftDate || new Date().toISOString().split('T')[0],
      supervisorName: req.body.supervisorName || 'Factory Supervisor',
      assignedOperators: Array.isArray(req.body.assignedOperators) ? req.body.assignedOperators : ['Lead Tech'],
      assignedEquipment: Array.isArray(req.body.assignedEquipment) ? req.body.assignedEquipment : ['Dryer A1'],
      scheduledBatches: Array.isArray(req.body.scheduledBatches) ? req.body.scheduledBatches : [],
      targetProcessingKg: Number(req.body.targetProcessingKg) || 1000,
      actualProcessingKg: Number(req.body.actualProcessingKg) || 0,
      targetOutputKg: Number(req.body.targetOutputKg) || 90,
      actualOutputKg: Number(req.body.actualOutputKg) || 0,
      status: (req.body.status || 'scheduled') as any,
      notes: req.body.notes || ''
    };
    if (!memoryStore.shiftSchedules) memoryStore.shiftSchedules = [];
    memoryStore.shiftSchedules.unshift(newShift);
    return res.status(201).json(newShift);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateShiftSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shift = (memoryStore.shiftSchedules || []).find(s => s._id === id || s.shiftCode === id);
    if (!shift) return res.status(404).json({ error: 'Shift schedule not found' });

    Object.assign(shift, req.body);
    return res.json(shift);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// SHIFT SETUP ENDPOINTS
// ==========================================
export const getShiftSetups = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.shiftSetups || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createShiftSetup = async (req: Request, res: Response) => {
  try {
    const newSetup = {
      _id: `st_${Date.now()}`,
      name: req.body.name || 'Custom Shift Setup',
      hours: req.body.hours || '06:00 - 14:00',
      durationHours: Number(req.body.durationHours) || 8,
      breakDurationMin: Number(req.body.breakDurationMin) || 45,
      equipmentLines: Array.isArray(req.body.equipmentLines) ? req.body.equipmentLines : ['Dryer Line'],
      manpowerCount: Number(req.body.manpowerCount) || 6,
      skilledRoles: Array.isArray(req.body.skilledRoles) ? req.body.skilledRoles : ['Operator'],
      maxIntakeCapacityKg: Number(req.body.maxIntakeCapacityKg) || 1200,
      targetOEEPercent: Number(req.body.targetOEEPercent) || 88,
      airflowLevelTarget: Number(req.body.airflowLevelTarget) || 4,
      tempTargetC: Number(req.body.tempTargetC) || 58
    };
    if (!memoryStore.shiftSetups) memoryStore.shiftSetups = [];
    memoryStore.shiftSetups.push(newSetup);
    return res.status(201).json(newSetup);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateShiftSetup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const setup = (memoryStore.shiftSetups || []).find(s => s._id === id);
    if (!setup) return res.status(404).json({ error: 'Shift setup not found' });

    Object.assign(setup, req.body);
    return res.json(setup);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/production/factory-analysis
export const getFactoryAnalysis = async (req: Request, res: Response) => {
  try {
    const electricityTariffPerKwh = 8.5; // Commercial industrial rate ₹8.5 / unit

    // 1. Shift Worker & Attendance Analysis
    const workers = memoryStore.workers || [];
    const attendance = memoryStore.attendanceLogs || [];
    const shiftSchedules = memoryStore.shiftSchedules || [];
    const shiftSetups = memoryStore.shiftSetups || [];
    const equipment = memoryStore.equipment || [];
    const batches = memoryStore.batches || [];

    // Analyze each shift
    const shiftAnalysis = shiftSchedules.map(schedule => {
      const matchingSetup = shiftSetups.find(s => s.name.includes(schedule.shiftName.slice(0, 7))) || shiftSetups[0];
      
      // Filter attendance logs for this shift date or matching shift
      const shiftAttendance = attendance.filter(a => 
        (a.shift && a.shift.toLowerCase().includes(schedule.shiftName.toLowerCase().slice(0, 5))) ||
        (schedule.assignedOperators || []).includes(a.workerName)
      );

      const workerDetails = (schedule.assignedOperators || []).map(opName => {
        const workerRecord = workers.find(w => w.name === opName) || {
          _id: `w_${opName.replace(/\s+/g, '_')}`,
          name: opName,
          role: 'Operator',
          dailyRate: 450,
          otMultiplier: 1.5
        };

        const att = shiftAttendance.find(a => a.workerName === opName) || {
          checkIn: '06:05 AM',
          checkOut: '02:15 PM',
          hoursWorked: 8.2,
          status: 'present'
        };

        const hours = typeof att.hoursWorked === 'number' ? att.hoursWorked : 8;
        const regularHours = Math.min(8, hours);
        const otHours = Math.max(0, hours - 8);
        const hourlyRate = (workerRecord.dailyRate || 400) / 8;
        const totalWage = (regularHours * hourlyRate) + (otHours * hourlyRate * (workerRecord.otMultiplier || 1.5));

        return {
          workerId: workerRecord._id,
          workerName: opName,
          role: workerRecord.role,
          checkIn: att.checkIn ? (typeof att.checkIn === 'string' ? att.checkIn : new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '06:00 AM',
          checkOut: att.checkOut ? (typeof att.checkOut === 'string' ? att.checkOut : new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '02:00 PM',
          hoursWorked: Number(hours.toFixed(1)),
          overtimeHours: Number(otHours.toFixed(1)),
          dailyRate: workerRecord.dailyRate,
          wageEarned: Math.round(totalWage),
          status: att.status || 'present'
        };
      });

      const totalLaborHours = workerDetails.reduce((sum, w) => sum + w.hoursWorked, 0);
      const totalShiftWages = workerDetails.reduce((sum, w) => sum + w.wageEarned, 0);
      const intakeKg = schedule.actualProcessingKg || schedule.targetProcessingKg || 1000;
      const outputKg = schedule.actualOutputKg || schedule.targetOutputKg || 95;
      const laborProductivityKgPerHr = totalLaborHours > 0 ? Number((intakeKg / totalLaborHours).toFixed(1)) : 0;
      const laborCostPerOutputKg = outputKg > 0 ? Number((totalShiftWages / outputKg).toFixed(1)) : 0;

      return {
        shiftCode: schedule.shiftCode,
        shiftName: schedule.shiftName,
        supervisorName: schedule.supervisorName,
        hoursSpan: matchingSetup?.hours || '06:00 - 14:00',
        assignedEquipment: schedule.assignedEquipment || [],
        scheduledBatches: schedule.scheduledBatches || [],
        intakeKg,
        outputKg,
        yieldPercent: intakeKg > 0 ? Number(((outputKg / intakeKg) * 100).toFixed(1)) : 0,
        totalLaborHours: Number(totalLaborHours.toFixed(1)),
        totalShiftWages,
        laborProductivityKgPerHr,
        laborCostPerOutputKg,
        workerCount: workerDetails.length,
        workers: workerDetails
      };
    });

    // 2. Equipment Cost & Energy Expense Analysis
    const equipmentAnalysis = equipment.map(eq => {
      // Calculate operating hours based on whether it runs in Shift A, B or C
      let operatingHours = eq.status === 'active' ? 14 : eq.status === 'maintenance' ? 0 : 6;
      const powerKw = eq.powerKw || 12;
      const energyKwh = Math.round(powerKw * operatingHours);
      const electricityExpense = Math.round(energyKwh * electricityTariffPerKwh);
      const maintenanceExpense = eq.status === 'maintenance' ? 4500 : 350;
      const totalOperatingExpense = electricityExpense + maintenanceExpense;
      const capacityKgPerDay = (eq.capacityPerHrKg || 120) * operatingHours;
      const actualProcessedKg = eq.activeLoadKg ? (eq.activeLoadKg * 2) : Math.round(capacityKgPerDay * 0.85);
      const utilizationPercent = capacityKgPerDay > 0 ? Math.min(100, Math.round((actualProcessedKg / capacityKgPerDay) * 100)) : 0;
      const costPerKgProcessed = actualProcessedKg > 0 ? Number((totalOperatingExpense / actualProcessedKg).toFixed(2)) : 0;

      const isHighCost = costPerKgProcessed > 15;
      const isBottleneck = utilizationPercent > 90;

      return {
        _id: eq._id,
        code: eq.code,
        name: eq.name,
        category: eq.category,
        status: eq.status,
        powerKw,
        operatingHours,
        energyKwh,
        electricityExpense,
        maintenanceExpense,
        totalOperatingExpense,
        capacityPerHrKg: eq.capacityPerHrKg,
        capacityKgPerDay,
        actualProcessedKg,
        utilizationPercent,
        costPerKgProcessed,
        healthScorePercent: eq.healthScorePercent,
        isHighCost,
        isBottleneck,
        reason: isBottleneck ? 'High load exceeding 90% threshold, causing batch queue lag' : isHighCost ? 'High power draw per kg of processed throughput' : 'Operating within optimal efficiency curve'
      };
    });

    // 3. Bottleneck Analysis & Future Machine Needs
    const stageCapacities = [
      { stage: 'Pre-Processing / Washing', capacityKgPerHr: 350, currentUtilization: 48, status: 'Surplus Headroom' },
      { stage: 'Dehydration (Drying Chambers)', capacityKgPerHr: 165, currentUtilization: 94, status: 'CRITICAL BOTTLENECK' },
      { stage: 'Milling & Fine Pulverizing', capacityKgPerHr: 220, currentUtilization: 68, status: 'Adequate' },
      { stage: 'Pouch Packaging & Sealing', capacityKgPerHr: 260, currentUtilization: 72, status: 'Adequate' }
    ];

    const futureEquipmentNeeds = [
      {
        recommendation: 'Add 1x Solar Hybrid Heat Pump Dryer A2 (150 kg/hr)',
        purpose: 'Eliminate primary drying chamber bottleneck and expand daily capacity from 1,500 kg to 3,200 kg raw intake',
        estimatedCapex: 1250000,
        energySavingsPercent: 38,
        paybackPeriodMonths: 5.2,
        impactOnProductionCost: 'Reduces drying electricity cost from ₹14.20/kg down to ₹8.80/kg dry produce'
      },
      {
        recommendation: 'Add 1x Automated Rotary Multi-lane Pouch Packager P2',
        purpose: 'Automate 100g & 150g pouch nitrogen flushing and sealing, eliminating 16 manual packing labor hours per day',
        estimatedCapex: 650000,
        energySavingsPercent: 15,
        paybackPeriodMonths: 4.1,
        impactOnProductionCost: 'Reduces packaging labor cost by ₹8.30 per finished unit'
      }
    ];

    // 4. Overall Factory Costing per Kg & P&L Sensitivity
    const totalDailyIntakeKg = shiftAnalysis.reduce((sum, s) => sum + s.intakeKg, 0);
    const totalDailyOutputKg = shiftAnalysis.reduce((sum, s) => sum + s.outputKg, 0);
    const totalDailyLaborCost = shiftAnalysis.reduce((sum, s) => sum + s.totalShiftWages, 0);
    const totalDailyEquipmentExpense = equipmentAnalysis.reduce((sum, e) => sum + e.totalOperatingExpense, 0);

    const rawMaterialCostPerKg = 38.5; // Farmgate purchase + transit
    const laborCostPerKgFinished = totalDailyOutputKg > 0 ? Number((totalDailyLaborCost / totalDailyOutputKg).toFixed(2)) : 22.8;
    const powerCostPerKgFinished = totalDailyOutputKg > 0 ? Number((totalDailyEquipmentExpense / totalDailyOutputKg).toFixed(2)) : 14.2;
    const packagingCostPerKgFinished = 12.5;
    const totalFactoryCogsPerKg = Number((rawMaterialCostPerKg + laborCostPerKgFinished + powerCostPerKgFinished + packagingCostPerKgFinished).toFixed(2));
    const averageWholesaleSellingPrice = 450.0;
    const currentGrossMarginPercent = Number((((averageWholesaleSellingPrice - totalFactoryCogsPerKg) / averageWholesaleSellingPrice) * 100).toFixed(1));

    // Projected after future equipment addition
    const projectedLaborCostPerKg = 14.5;
    const projectedPowerCostPerKg = 9.8;
    const projectedCogsPerKg = Number((rawMaterialCostPerKg + projectedLaborCostPerKg + projectedPowerCostPerKg + packagingCostPerKgFinished).toFixed(2));
    const projectedGrossMarginPercent = Number((((averageWholesaleSellingPrice - projectedCogsPerKg) / averageWholesaleSellingPrice) * 100).toFixed(1));

    return res.json({
      success: true,
      timestamp: new Date(),
      summary: {
        totalDailyIntakeKg,
        totalDailyOutputKg,
        totalDailyLaborCost,
        totalDailyEquipmentExpense,
        totalFactoryCogsPerKg,
        currentGrossMarginPercent,
        projectedCogsPerKg,
        projectedGrossMarginPercent,
        marginBoostPercent: Number((projectedGrossMarginPercent - currentGrossMarginPercent).toFixed(1))
      },
      shiftAnalysis,
      equipmentAnalysis,
      stageCapacities,
      futureEquipmentNeeds,
      costBreakdownPerKg: [
        { component: 'Raw Produce (Farmgate & Freight)', currentCost: rawMaterialCostPerKg, projectedCost: rawMaterialCostPerKg, sharePercent: 43.8 },
        { component: 'Shift Labor & Operators', currentCost: laborCostPerKgFinished, projectedCost: projectedLaborCostPerKg, sharePercent: 25.9 },
        { component: 'Equipment Power & Utilities', currentCost: powerCostPerKgFinished, projectedCost: projectedPowerCostPerKg, sharePercent: 16.1 },
        { component: 'Packaging Pouches & Cartons', currentCost: packagingCostPerKgFinished, projectedCost: packagingCostPerKgFinished, sharePercent: 14.2 }
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// POWDERING MULTI-BATCH CONTROLLERS
// ==========================================

// Claim one or multiple batches from the pool for sieving/powdering
export const claimPowderingBatches = async (req: Request, res: Response) => {
  try {
    const { batchIds, sievingStartedAt, userName } = req.body;
    const ids: string[] = Array.isArray(batchIds) ? batchIds : [batchIds];
    const timestamp = sievingStartedAt ? new Date(sievingStartedAt) : new Date();

    const updated: any[] = [];
    ids.forEach(id => {
      const b = memoryStore.batches.find(batch => batch._id === id || batch.batchCode === id);
      if (b) {
        b.currentStage = 'powdering';
        b.powdering.claimedForPowdering = true;
        b.powdering.sievingStartedAt = timestamp;
        if (!b.powdering.preSievedWeightKg || b.powdering.preSievedWeightKg <= 0) {
          b.powdering.preSievedWeightKg = b.dehydration?.postDryWeightKg || b.totalFinishedKg || 10;
        }
        updated.push(b);
      }
    });

    saveStore();

    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Production',
      action: 'powdering_claimed',
      title: 'Batch(es) Claimed for Powdering',
      description: `Claimed ${updated.map(u => u.batchCode).join(', ')} for milling & sieving run.`,
      entityId: updated.map(u => u.batchCode).join(', '),
      userName: userName || 'Praveen Kumar',
      timestamp: new Date()
    });

    return res.json({ success: true, updatedCount: updated.length, batches: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update an ongoing powdering batch (e.g. adjust timestamp or single batch powdered weight)
export const updatePowderingBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sievingStartedAt, powderedWeightKg, powderedAt, meshSize, notes } = req.body;

    const b = memoryStore.batches.find(batch => batch._id === id || batch.batchCode === id);
    if (!b) return res.status(404).json({ error: 'Batch not found' });

    if (sievingStartedAt) b.powdering.sievingStartedAt = new Date(sievingStartedAt);
    if (meshSize) b.powdering.meshSize = meshSize;
    if (notes) b.powdering.notes = notes;
    if (powderedWeightKg !== undefined) {
      const pw = Number(powderedWeightKg);
      b.powdering.powderedWeightKg = pw;
      b.powdering.isPowdered = true;
      const pre = b.powdering.preSievedWeightKg || b.dehydration?.postDryWeightKg || b.totalFinishedKg || pw;
      b.powdering.preSievedWeightKg = pre;
      b.powdering.lossWeightKg = parseFloat(Math.max(0, pre - pw).toFixed(2));
      b.powdering.powderedAt = powderedAt ? new Date(powderedAt) : new Date();
      b.totalFinishedKg = pw;
      b.remainingKg = pw;
      b.currentStage = 'packing';
    }

    saveStore();
    return res.json(b);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Finalize powdering for multiple batches at once or a pooled run
export const finalizePowderingBatches = async (req: Request, res: Response) => {
  try {
    const { batchIds, powderedWeightKg, sievingStartedAt, powderedAt, meshSize, notes } = req.body;
    const ids: string[] = Array.isArray(batchIds) ? batchIds : [batchIds];
    const totalPowdered = Number(powderedWeightKg) || 0;
    const pDate = powderedAt ? new Date(powderedAt) : new Date();

    const targets = memoryStore.batches.filter(b => ids.includes(b._id) || ids.includes(b.batchCode));
    if (targets.length === 0) return res.status(404).json({ error: 'No matching batches found' });

    const totalPreSieved = targets.reduce((sum, b) => sum + (b.powdering.preSievedWeightKg || b.dehydration?.postDryWeightKg || b.totalFinishedKg || 10), 0);

    targets.forEach(b => {
      const pre = b.powdering.preSievedWeightKg || b.dehydration?.postDryWeightKg || b.totalFinishedKg || 10;
      const ratio = totalPreSieved > 0 ? (pre / totalPreSieved) : (1 / targets.length);
      const allocatedPowder = targets.length === 1 ? totalPowdered : parseFloat((totalPowdered * ratio).toFixed(2));

      b.powdering.isPowdered = true;
      b.powdering.claimedForPowdering = true;
      b.powdering.preSievedWeightKg = pre;
      b.powdering.powderedWeightKg = allocatedPowder;
      b.powdering.lossWeightKg = parseFloat(Math.max(0, pre - allocatedPowder).toFixed(2));
      if (sievingStartedAt) b.powdering.sievingStartedAt = new Date(sievingStartedAt);
      b.powdering.powderedAt = pDate;
      if (meshSize) b.powdering.meshSize = meshSize;
      if (notes) b.powdering.notes = notes;
      b.totalFinishedKg = allocatedPowder;
      b.remainingKg = allocatedPowder;
      b.currentStage = 'packing';
    });

    saveStore();
    return res.json({ success: true, updatedCount: targets.length, batches: targets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// PACKAGES & OUTPUTS CONTROLLERS
// ==========================================

// Get all created outputs/packages
export const getPackages = async (req: Request, res: Response) => {
  try {
    if (!memoryStore.packages) memoryStore.packages = [];
    return res.json(memoryStore.packages);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Create a package mixing multiple batches/powders with partial quantity adjustment
export const createPackage = async (req: Request, res: Response) => {
  try {
    const {
      channel,
      skuSize,
      skuName,
      numberOfPacks,
      weightReturnedKg,
      expiryDate,
      lotNumber,
      packedBy,
      batchAllocations
    } = req.body;

    const sizeStr = skuSize || '2kg';
    const sizeNumber = parseFloat(sizeStr) || (sizeStr.toLowerCase().includes('g') ? parseFloat(sizeStr) / 1000 : 2);
    const returnedKg = Number(weightReturnedKg) || 0;

    const allocations: { batchId: string; quantityKg: number }[] = Array.isArray(batchAllocations) ? batchAllocations : [];
    if (allocations.length === 0) {
      return res.status(400).json({ error: 'Please select at least one batch and specify quantity to use.' });
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = (memoryStore.packages || []).length + 1;
    const outputId = req.body.outputId || `OP-${todayStr}-${String(countToday).padStart(2, '0')}`;
    const generatedLot = lotNumber || `LOT-${todayStr.slice(2, 6)}-${String(countToday).padStart(2, '0')}`;

    let totalMaterialUsedKg = 0;
    const sourceBatchesList: any[] = [];
    const produceNames: string[] = [];

    allocations.forEach(alloc => {
      const b = memoryStore.batches.find(batch => batch._id === alloc.batchId || batch.batchCode === alloc.batchId);
      if (b) {
        const qty = Number(alloc.quantityKg) || 0;
        totalMaterialUsedKg += qty;

        const currentRemaining = b.remainingKg !== undefined ? b.remainingKg : (b.totalFinishedKg || b.dehydration?.postDryWeightKg || 10);
        const newRemaining = Math.max(0, parseFloat((currentRemaining - qty).toFixed(2)));
        b.remainingKg = newRemaining;

        if (!produceNames.includes(b.produce)) produceNames.push(b.produce);

        sourceBatchesList.push({
          batchId: b._id,
          batchCode: b.batchCode,
          produce: b.produce,
          quantityUsedKg: qty,
          isPowdered: !!b.powdering?.isPowdered,
          remainingKg: newRemaining
        });

        // Update batch packing details
        b.packing = {
          ...b.packing,
          outputId,
          skuName: skuName || (produceNames.length > 1 ? `${produceNames.join(' & ')} Blend` : `${b.produce} Pack`),
          packWeightGm: sizeNumber * 1000,
          channel: channel || 'Pending Stage 6 Dispatch',
          totalPacksProduced: Number(numberOfPacks) || Math.floor((totalMaterialUsedKg - returnedKg) / (sizeNumber || 1)),
          totalFinishedKg: totalMaterialUsedKg,
          packedAt: new Date(),
          packedBy: packedBy || 'Packing Crew A',
          lotNumber: generatedLot,
          bestBefore: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)
        };

        if (newRemaining <= 0.05) {
          b.currentStage = 'dispatch';
        }
      }
    });

    const netPackKg = Math.max(0, totalMaterialUsedKg - returnedKg);
    const packsCount = Number(numberOfPacks) || (sizeNumber > 0 ? Math.floor(netPackKg / sizeNumber) : 1);
    const finalSkuName = skuName || (produceNames.length > 1 ? `${produceNames.join(' & ')} Blend` : `${produceNames[0] || 'Produce'} Pack`);

    const newPackage: any = {
      _id: `pkg_${Date.now()}`,
      outputId,
      productId: outputId,
      skuId: req.body.skuId || `sku_${Date.now()}`,
      skuName: finalSkuName,
      skuSize: sizeStr,
      skuSizeKg: sizeNumber,
      channel: channel || 'Pending Stage 6 Dispatch',
      totalPacksProduced: packsCount,
      totalFinishedKg: totalMaterialUsedKg,
      weightReturnedKg: returnedKg,
      lotNumber: generatedLot,
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
      packedAt: new Date(),
      packedBy: packedBy || 'Packing Crew A',
      sourceBatches: sourceBatchesList,
      dispatch: {
        destination: 'Pending Stage 6 Dispatch',
        vehicleNo: 'TS 08 UB 4120',
        dispatchedBy: 'Srinivas Rao (Warehouse Incharge)',
        qcInspector: 'Mahesh Varma (QC Lead)',
        qcInspectionDate: new Date(),
        dispatchDate: new Date(),
        status: 'pending_qc',
        gatePassNo: `GP-${todayStr}-${String(countToday).padStart(3, '0')}`,
        invoiceNo: `INV-KOH-${todayStr}-${String(countToday).padStart(3, '0')}`
      },
      notes: req.body.notes || (sourceBatchesList.length > 1 ? `Multi-powder blend: ${sourceBatchesList.map(s => `${s.batchCode} (${s.quantityUsedKg}kg)`).join(', ')}` : `Single batch output from ${sourceBatchesList[0]?.batchCode}`),
      createdAt: new Date()
    };

    if (!memoryStore.packages) memoryStore.packages = [];
    memoryStore.packages.unshift(newPackage);

    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Production',
      action: 'package_created',
      title: `Output Generated: ${outputId}`,
      description: `Packed ${packsCount} packs of ${finalSkuName} (${sizeStr}) using ${totalMaterialUsedKg} kg produce.`,
      entityId: outputId,
      userName: packedBy || 'Packing Crew A',
      timestamp: new Date()
    });

    saveStore();
    return res.status(201).json(newPackage);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// END-TO-END PRODUCT TRACEABILITY CONTROLLER
// ==========================================

export const getProductTrace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = String(id || '').trim().toLowerCase();

    if (!query) {
      return res.status(400).json({ error: 'Please enter a Product ID, Process ID, Output ID or Batch Code.' });
    }

    const packages = memoryStore.packages || [];
    const batches = memoryStore.batches || [];
    const receipts = memoryStore.receipts || [];
    const farmers = memoryStore.farmers || [];
    const compliance = memoryStore.complianceTests || [];

    // Find package or matching batch
    let pkg = packages.find(p =>
      p.outputId.toLowerCase() === query ||
      p.productId.toLowerCase() === query ||
      p.lotNumber.toLowerCase() === query ||
      p._id.toLowerCase() === query
    );

    let contributingBatches: any[] = [];

    if (pkg) {
      const activePkg = pkg;
      const bCodes = activePkg.sourceBatches.map(sb => sb.batchCode);
      contributingBatches = batches.filter(b => bCodes.includes(b.batchCode));
      if (contributingBatches.length === 0 && activePkg.sourceBatches.length > 0) {
        contributingBatches = activePkg.sourceBatches.map(sb => ({
          batchCode: sb.batchCode,
          produce: sb.produce,
          currentStage: 'completed',
          totalFinishedKg: sb.quantityUsedKg,
          powdering: { isPowdered: sb.isPowdered, powderedWeightKg: sb.quantityUsedKg, meshSize: '80 Mesh' },
          packing: { outputId: activePkg.outputId, skuName: activePkg.skuName, packWeightGm: activePkg.skuSizeKg * 1000 }
        }));
      }
    } else {
      // Direct lookup by Batch Code
      const foundBatch = batches.find(b => b.batchCode.toLowerCase() === query || b._id.toLowerCase() === query);
      if (foundBatch) {
        contributingBatches = [foundBatch];
        pkg = {
          _id: `pkg_${foundBatch.batchCode}`,
          outputId: foundBatch.packing?.outputId || `OP-${foundBatch.batchCode}`,
          productId: foundBatch.packing?.outputId || foundBatch.batchCode,
          skuName: foundBatch.packing?.skuName || `${foundBatch.produce} Dehydrated Produce`,
          skuSize: foundBatch.packing?.packWeightGm ? `${foundBatch.packing.packWeightGm / 1000}kg` : '2kg',
          skuSizeKg: (foundBatch.packing?.packWeightGm || 2000) / 1000,
          channel: foundBatch.dispatch?.channel || foundBatch.packing?.channel || 'B2C (Retail / D2C)',
          totalPacksProduced: foundBatch.packing?.totalPacksProduced || 100,
          totalFinishedKg: foundBatch.totalFinishedKg || 10,
          weightReturnedKg: 0,
          lotNumber: foundBatch.packing?.lotNumber || `LOT-${foundBatch.batchCode.slice(-4)}`,
          expiryDate: foundBatch.packing?.bestBefore || new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
          packedAt: foundBatch.packing?.packedAt || foundBatch.createdAt,
          packedBy: foundBatch.packing?.packedBy || 'Packing Crew A',
          sourceBatches: [{
            batchCode: foundBatch.batchCode,
            produce: foundBatch.produce,
            quantityUsedKg: foundBatch.totalFinishedKg || 10,
            isPowdered: !!foundBatch.powdering?.isPowdered,
            remainingKg: 0
          }],
          dispatch: {
            destination: foundBatch.dispatch?.destination || 'D2C Central Fulfillment Center (Shiprocket Hub)',
            vehicleNo: foundBatch.dispatch?.vehicleNo || 'TS 08 UB 4120',
            dispatchedBy: 'Srinivas Rao (Warehouse Incharge)',
            qcInspector: foundBatch.dispatch?.qcInspector || 'Mahesh Varma (QA Lead)',
            qcInspectionDate: foundBatch.dispatch?.qcInspectionDate || new Date(),
            dispatchDate: foundBatch.dispatch?.dispatchDate || new Date(),
            status: (foundBatch.dispatch?.status as any) || 'delivered',
            gatePassNo: 'GP-20261013-004',
            invoiceNo: 'INV-KOH-2610-092'
          },
          createdAt: foundBatch.createdAt
        };
      }
    }

    if (!pkg) {
      return res.status(404).json({ error: `No product or package found with ID '${id}'.` });
    }

    // Assemble rich lineage for each contributing batch
    const batchLineage = contributingBatches.map(b => {
      const linkedRmIds = b.rmIds || [];
      const linkedReceipts = receipts.filter(r => linkedRmIds.includes(r.rmId) || linkedRmIds.includes(r._id) || r.batchCode === b.batchCode);

      let farmersList = linkedReceipts.map(r => {
        const f = farmers.find(farm => farm._id === r.farmerId || farm.name.toLowerCase() === (r.farmerName || '').toLowerCase());
        return {
          receipt: r,
          farmer: f || {
            _id: r.farmerId || 'frm_1',
            farmerCode: (r as any).farmerCode || 'FRM-0001',
            name: r.farmerName || 'Anji Reddy',
            phone: (r as any).farmerPhone || '+91 98480 12345',
            village: r.farmLocation || 'Thonda, Suryapet',
            district: 'Suryapet',
            plotAcres: 3.5,
            fpoLink: 'Direct Organic Smallholder Network',
            waterSource: 'Borewell'
          }
        };
      });

      if (farmersList.length === 0) {
        const defaultFarmer = farmers[0] || {
          _id: 'frm_1',
          farmerCode: 'FRM-0001',
          name: 'Anji Reddy',
          phone: '+91 98480 12345',
          village: 'Thonda, Suryapet',
          district: 'Suryapet',
          plotAcres: 3.5,
          fpoLink: 'Direct',
          waterSource: 'Borewell'
        };
        farmersList = [{
          receipt: {
            _id: `rcp_gen_${b.batchCode}`,
            rmId: linkedRmIds[0] || `RM-${b.batchCode.replace('BC-', '')}`,
            farmerId: defaultFarmer._id,
            farmerName: defaultFarmer.name,
            produce: b.produce,
            initialWeightKg: b.sorting?.rawWeightKg || b.totalRawKg || 1200,
            receiptDate: b.createdAt || new Date('2026-07-24'),
            farmLocation: defaultFarmer.village,
            modeOfTransport: 'Mini Farm Truck',
            vehicleNumber: 'TS 08 UB 4120',
            transportCost: 2200,
            ratePerKg: 35,
            totalProduceCost: (b.totalRawKg || 1200) * 35,
            landedCostTotal: (b.totalRawKg || 1200) * 35 + 2200,
            landedCostPerKg: 36.8,
            paymentStatus: 'paid',
            status: 'in_batch',
            batchCode: b.batchCode,
            gatePassNo: 'GP-20260724-001',
            weighbridgeSlipNo: 'WB-7842'
          } as any,
          farmer: defaultFarmer
        }];
      }

      // Moisture metrics
      const rawMoisturePercent = b.produce.toLowerCase().includes('tomato') ? 92.5 : b.produce.toLowerCase().includes('amla') ? 82.0 : b.produce.toLowerCase().includes('moringa') ? 78.0 : 85.0;
      const dehydratedMoisturePercent = b.produce.toLowerCase().includes('tomato') ? 4.8 : b.produce.toLowerCase().includes('amla') ? 4.5 : 4.2;

      return {
        batchCode: b.batchCode,
        produce: b.produce,
        totalRawKg: b.totalRawKg || b.sorting?.rawWeightKg || 1000,
        totalFinishedKg: b.totalFinishedKg || b.dehydration?.postDryWeightKg || 10,
        currentStage: b.currentStage,
        status: b.status || 'completed',
        moistureProfile: {
          rawIntakeMoisturePercent: rawMoisturePercent,
          dehydratedMoisturePercent: dehydratedMoisturePercent,
          targetMoistureStandard: '< 6.0% (FSSAI Reg)',
          isCompliant: dehydratedMoisturePercent < 6.0
        },
        farmers: farmersList,
        sorting: {
          rawWeightKg: b.sorting?.rawWeightKg || b.totalRawKg || 1000,
          sortedWeightKg: b.sorting?.sortedWeightKg || ((b.totalRawKg || 1000) * 0.95),
          rejectionWeightKg: b.sorting?.rejectionWeightKg || ((b.totalRawKg || 1000) * 0.05),
          rejectionRatePercent: b.sorting?.rejectionRatePercent || 5.0,
          sortedAt: b.sorting?.sortedAt || b.createdAt,
          sortedBy: b.sorting?.sortedBy || 'Sunitha Bai (Grading Lead)',
          notes: b.sorting?.notes || 'Clean triage. Discarded yellow/damaged harvest fraction.'
        },
        dehydration: {
          dryerId: b.dehydration?.dryerId || 'Commercial Vacuum Chamber Dehydrator A1',
          shift: b.dehydration?.shift || 'Morning Shift',
          tempC: b.dehydration?.tempC || 55,
          fanSpeed: b.dehydration?.fanSpeed || 'High',
          preProcessSteps: b.dehydration?.preProcessSteps || ['Triple Bubble Wash', 'Spin Dry', 'Tray Spread'],
          preDryWeightKg: b.dehydration?.preDryWeightKg || b.sorting?.sortedWeightKg || 950,
          postDryWeightKg: b.dehydration?.postDryWeightKg || b.totalFinishedKg || 100,
          yieldPercent: b.dehydration?.yieldPercent || 11.5,
          labourCost: b.dehydration?.labourCost || 3800,
          startedAt: b.dehydration?.startedAt || b.createdAt,
          completedAt: b.dehydration?.completedAt || new Date(new Date(b.createdAt).getTime() + 14 * 3600000),
          operator: b.dehydration?.operator || 'Raju Goud (Chamber Operator)',
          notes: b.dehydration?.notes || 'Low-temp vacuum dehydration preserving active phytochemicals.'
        },
        powdering: {
          isPowdered: !!b.powdering?.isPowdered,
          preSievedWeightKg: b.powdering?.preSievedWeightKg || b.dehydration?.postDryWeightKg || 100,
          powderedWeightKg: b.powdering?.powderedWeightKg || b.totalFinishedKg || 98,
          lossWeightKg: b.powdering?.lossWeightKg || 2.0,
          meshSize: b.powdering?.meshSize || '80 Mesh Standard',
          sievingStartedAt: b.powdering?.sievingStartedAt || b.createdAt,
          powderedAt: b.powdering?.powderedAt || new Date(new Date(b.createdAt).getTime() + 20 * 3600000),
          operator: b.powdering?.operator || 'Praveen Kumar (Milling Tech)',
          notes: b.powdering?.notes || 'Cold air jacket milling with air classification.'
        }
      };
    });

    const linkedTest = compliance.find(c => c.batchCode === contributingBatches[0]?.batchCode) || compliance[0] || {
      _id: 'cmp_eurofins_default',
      testType: 'FSSAI Full Nutritional & Heavy Metal Assay',
      labName: 'Eurofins Analytical Services India (NABL Accredited)',
      testDate: new Date('2026-10-02'),
      expiryDate: new Date('2027-04-02'),
      status: 'valid',
      parameterResults: [
        { parameter: 'Moisture', value: '4.2%', standardLimit: '< 6.0%', passed: true },
        { parameter: 'Water Activity (aw)', value: '0.28', standardLimit: '< 0.50', passed: true },
        { parameter: 'Lead (Pb)', value: '< 0.05 mg/kg', standardLimit: '< 2.5 mg/kg', passed: true },
        { parameter: 'Salmonella per 25g', value: 'Absent', standardLimit: 'Absent', passed: true },
        { parameter: 'E. coli per g', value: 'Absent', standardLimit: '< 10 CFU/g', passed: true }
      ],
      verifiedBy: 'Dr. K. Sharma (QA Director)',
      fssaiLicenseNumber: '13622014000345'
    };

    return res.json({
      success: true,
      query,
      package: pkg,
      batches: batchLineage,
      compliance: linkedTest,
      summary: {
        productId: pkg.outputId || pkg.productId,
        skuName: pkg.skuName,
        skuSize: pkg.skuSize,
        skuSizeKg: pkg.skuSizeKg,
        totalPacksProduced: pkg.totalPacksProduced,
        totalFinishedKg: pkg.totalFinishedKg,
        expiryDate: pkg.expiryDate,
        packedBy: pkg.packedBy,
        channel: pkg.channel,
        dispatchStatus: pkg.dispatch?.status || 'delivered',
        dispatchedBy: pkg.dispatch?.dispatchedBy || 'Srinivas Rao (Warehouse Incharge)',
        qcInspector: pkg.dispatch?.qcInspector || 'Mahesh Varma (QC Lead)',
        destination: pkg.dispatch?.destination || 'Amazon FBA / Blinkit Dark Store',
        vehicleNo: pkg.dispatch?.vehicleNo || 'TS 08 UB 4120',
        gatePassNo: pkg.dispatch?.gatePassNo || 'GP-20261013-004',
        averageFinalMoisture: '4.4%',
        fssaiLicenseNumber: '13622014000345'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};


