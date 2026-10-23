import { IMemoryStore } from './storeService';

export const seedAllProductionData = (store: IMemoryStore) => {
  // 1. Batches (Full Dehydration Production Lifecycle)
  if (!store.batches || store.batches.length === 0) {
    store.batches = [
      {
        _id: 'btc_1',
        batchCode: 'BC-20261011-01',
        produce: 'Moringa',
        rmIds: ['rm_1', 'rm_101'],
        currentStage: 'completed',
        sorting: {
          rawWeightKg: 1200,
          sortedWeightKg: 1140,
          rejectionWeightKg: 60,
          rejectionRatePercent: 5.0,
          sortedAt: new Date('2026-10-11T09:30:00Z'),
          sortedBy: 'Sunitha Bai',
          notes: 'Destemmed organic PKM-1 Moringa leaves. Zero yellow leaf contamination.'
        },
        dehydration: {
          dryerId: 'EQP-D01',
          shift: 'Morning Shift',
          tempC: 55,
          fanSpeed: 'High',
          preProcessSteps: ['Triple Bubble Wash', 'Spin Dry', 'Tray Spread 1.2kg/sqm'],
          preDryWeightKg: 1140,
          postDryWeightKg: 134.4,
          yieldPercent: 11.79,
          labourCost: 4400,
          utilityCost: 2800,
          startedAt: new Date('2026-10-11T11:00:00Z'),
          completedAt: new Date('2026-10-11T23:00:00Z'),
          operator: 'Raju Goud',
          notes: 'Vacuum dehydration at 55°C maintained intact chlorophyll and delicate enzymes.'
        },
        powdering: {
          isPowdered: true,
          preSievedWeightKg: 134.4,
          powderedWeightKg: 132.8,
          meshSize: '120 Mesh Ultra-Fine',
          lossWeightKg: 1.6,
          powderedAt: new Date('2026-10-12T08:30:00Z'),
          operator: 'Praveen Kumar',
          notes: 'Cold hammer-milled with air classification to prevent frictional heat damage.'
        },
        packing: {
          outputId: 'out_mor_100g',
          skuId: 'sku_mor_100',
          skuName: 'Pure Green Moringa Leaf Powder 100g',
          packWeightGm: 100,
          channel: 'Amazon FBA / D2C',
          totalPacksProduced: 1328,
          totalFinishedKg: 132.8,
          packagingCost: 5976,
          packedAt: new Date('2026-10-12T14:00:00Z'),
          packedBy: 'Kavitha Reddy',
          lotNumber: 'LOT-MOR-2610-01',
          bestBefore: new Date('2028-04-12'),
          notes: 'Packed in high-barrier multi-layer Kraft standup zipper pouches with nitrogen flush.'
        },
        dispatch: {
          destination: 'Amazon FBA Fulfilment Center, Hyderabad',
          vehicleNo: 'TS 08 UB 4120',
          qualitySignOff: true,
          qcInspector: 'Mahesh Varma',
          qcInspectionDate: new Date('2026-10-13T10:00:00Z'),
          dispatchDate: new Date('2026-10-13T16:30:00Z'),
          dispatchedPacks: 1328,
          status: 'delivered',
          notes: 'Delivery acknowledged with clean COA and gate pass GP-20261013-004.'
        },
        totalRawKg: 1200,
        totalFinishedKg: 132.8,
        totalBatchCost: 48600,
        status: 'completed',
        createdAt: new Date('2026-10-11T08:00:00Z')
      },
      {
        _id: 'btc_2',
        batchCode: 'BC-20261012-02',
        produce: 'Amla',
        rmIds: ['rm_2'],
        currentStage: 'packing',
        sorting: {
          rawWeightKg: 850,
          sortedWeightKg: 810,
          rejectionWeightKg: 40,
          rejectionRatePercent: 4.7,
          sortedAt: new Date('2026-10-12T10:00:00Z'),
          sortedBy: 'Sunitha Bai',
          notes: 'High-tannin wild forest Amla. Minor blemish rejection.'
        },
        dehydration: {
          dryerId: 'EQP-D01',
          shift: 'Night Shift',
          tempC: 58,
          fanSpeed: 'Medium',
          preProcessSteps: ['Potable Bubble Wash', 'Mechanical Seed Extraction', '4mm Segment Slice'],
          preDryWeightKg: 810,
          postDryWeightKg: 98.0,
          yieldPercent: 12.1,
          labourCost: 3800,
          utilityCost: 2400,
          startedAt: new Date('2026-10-12T20:00:00Z'),
          completedAt: new Date('2026-10-13T12:00:00Z'),
          operator: 'Raju Goud',
          notes: 'Ascorbic acid assay confirms 94% retention under 58°C gentle dehydrator curve.'
        },
        powdering: {
          isPowdered: true,
          preSievedWeightKg: 98.0,
          powderedWeightKg: 97.2,
          meshSize: '100 Mesh Bioactive',
          lossWeightKg: 0.8,
          powderedAt: new Date('2026-10-13T15:00:00Z'),
          operator: 'Praveen Kumar',
          notes: 'Fine amber powder with crisp aroma and intense natural sour tang.'
        },
        packing: {
          outputId: 'out_aml_100g',
          skuId: 'sku_aml_100',
          skuName: 'Wild Amla Bioactive C Powder 100g',
          packWeightGm: 100,
          channel: 'D2C / Blinkit',
          totalPacksProduced: 650,
          totalFinishedKg: 65.0,
          packagingCost: 9100,
          packedAt: new Date('2026-10-14T01:30:00Z'),
          packedBy: 'Kavitha Reddy',
          lotNumber: 'LOT-AML-2610-02',
          bestBefore: new Date('2028-10-14'),
          notes: 'Hexagon PET jars with tamper-evident induction seal cap. 322 packs remaining in run.'
        },
        dispatch: {
          destination: 'Blinkit Dark Store Hub, Madhapur',
          vehicleNo: 'TS 09 EA 8812',
          qualitySignOff: true,
          qcInspector: 'Mahesh Varma',
          qcInspectionDate: new Date('2026-10-14T02:00:00Z'),
          dispatchedPacks: 0,
          status: 'pending',
          notes: 'Packaging run completing in Morning shift for afternoon dispatch.'
        },
        totalRawKg: 850,
        totalFinishedKg: 97.2,
        totalBatchCost: 42500,
        status: 'active',
        createdAt: new Date('2026-10-12T09:00:00Z')
      },
      {
        _id: 'btc_3',
        batchCode: 'BC-20261013-01',
        produce: 'Sweet Carrot',
        rmIds: ['rm_104'],
        currentStage: 'dehydration',
        sorting: {
          rawWeightKg: 600,
          sortedWeightKg: 575,
          rejectionWeightKg: 25,
          rejectionRatePercent: 4.17,
          sortedAt: new Date('2026-10-13T11:00:00Z'),
          sortedBy: 'Sunitha Bai',
          notes: 'Deep orange carrots from Jangaon cluster with high natural sugar.'
        },
        dehydration: {
          dryerId: 'EQP-D02',
          shift: 'Morning Shift',
          tempC: 54,
          fanSpeed: 'High',
          preProcessSteps: ['Food-Grade Wash', 'Peeling & Ends Trim', '3mm Fluted Wavy Slicing'],
          preDryWeightKg: 575,
          postDryWeightKg: 0,
          yieldPercent: 0,
          labourCost: 3200,
          startedAt: new Date('2026-10-13T18:00:00Z'),
          operator: 'Ramesh Kumar',
          notes: 'Convective drying underway. Chamber hygrometer reads 14% ambient humidity.'
        },
        powdering: {
          isPowdered: false,
          preSievedWeightKg: 0,
          powderedWeightKg: 0,
          meshSize: 'Crispy Snack Cut',
          lossWeightKg: 0
        },
        packing: {
          outputId: 'out_car_50g',
          skuName: 'Crispy Sweet Carrot Crunchies 50g',
          packWeightGm: 50,
          channel: 'D2C / Quick Commerce',
          totalPacksProduced: 0,
          totalFinishedKg: 0,
          packagingCost: 0,
          lotNumber: 'LOT-CAR-2610-01'
        },
        dispatch: {
          destination: 'Finished Goods Bay',
          qualitySignOff: false,
          dispatchedPacks: 0,
          status: 'in_progress'
        },
        totalRawKg: 600,
        totalFinishedKg: 0,
        totalBatchCost: 26500,
        status: 'active',
        createdAt: new Date('2026-10-13T10:00:00Z')
      },
      {
        _id: 'btc_4',
        batchCode: 'BC-20261014-01',
        produce: 'Beetroot',
        rmIds: ['rm_105'],
        currentStage: 'sorting',
        sorting: {
          rawWeightKg: 750,
          sortedWeightKg: 715,
          rejectionWeightKg: 35,
          rejectionRatePercent: 4.67,
          sortedAt: new Date('2026-10-14T02:00:00Z'),
          sortedBy: 'Sunitha Bai',
          notes: 'High betalain ruby beetroot. Soil washing and visual triage in progress.'
        },
        dehydration: {
          dryerId: 'EQP-D02',
          shift: 'Evening Shift',
          tempC: 56,
          fanSpeed: 'Medium',
          preProcessSteps: ['High-Pressure Jet Wash', '2.5mm Julienne Slicing'],
          preDryWeightKg: 0,
          postDryWeightKg: 0,
          yieldPercent: 0,
          labourCost: 0
        },
        powdering: {
          isPowdered: false,
          preSievedWeightKg: 0,
          powderedWeightKg: 0,
          meshSize: 'Solar Flakes',
          lossWeightKg: 0
        },
        packing: {
          outputId: 'out_bee_80g',
          skuName: 'Solar Dried Beetroot Flakes 80g',
          packWeightGm: 80,
          channel: 'D2C',
          totalPacksProduced: 0,
          totalFinishedKg: 0,
          packagingCost: 0,
          lotNumber: 'LOT-BEE-2610-01'
        },
        dispatch: {
          destination: 'Production line queue',
          qualitySignOff: false,
          dispatchedPacks: 0,
          status: 'in_queue'
        },
        totalRawKg: 750,
        totalFinishedKg: 0,
        totalBatchCost: 22000,
        status: 'active',
        createdAt: new Date('2026-10-14T01:00:00Z')
      }
    ];
  }

  // Ensure screenshot batches exist for exact UI fidelity and rich pool testing
  const screenshotBatches = [
    { batchCode: 'BC-20260725-0001', produce: 'Tomato', weight: 19.6, stage: 'powdering', isPowdered: false, rawKg: 280, farmerName: 'Lakshmi Devi', rmId: 'RM-20260724-0001' },
    { batchCode: 'BC-20260727-0001', produce: 'Tomato', weight: 12.48, stage: 'powdering', isPowdered: false, rawKg: 180, farmerName: 'Lakshmi Devi', rmId: 'RM-20260726-0001' },
    { batchCode: 'BC-20260727-0002', produce: 'Dehydrated Amla', weight: 10.0, stage: 'packing', isPowdered: true, preSieved: 14.95, rawKg: 120, farmerName: 'Venkat Rao', rmId: 'RM-20260726-0002', sievingStart: '2026-09-03T08:34:00Z', powderedAt: '2026-09-21T22:45:00Z' },
    { batchCode: 'BC-20260727-0003', produce: 'Tomato', weight: 6.78, stage: 'powdering', isPowdered: false, rawKg: 98, farmerName: 'Lakshmi Devi', rmId: 'RM-20260726-0003' },
    { batchCode: 'BC-20260727-0004', produce: 'Tomato', weight: 12.48, stage: 'powdering', isPowdered: false, rawKg: 180, farmerName: 'Lakshmi Devi', rmId: 'RM-20260726-0004' },
    { batchCode: 'BC-20260727-0005', produce: 'Tomato', weight: 6.34, stage: 'powdering', isPowdered: false, rawKg: 92, farmerName: 'Lakshmi Devi', rmId: 'RM-20260726-0005' },
    { batchCode: 'BC-20260727-0006', produce: 'Tomato', weight: 13.0, stage: 'powdering', isPowdered: false, rawKg: 190, farmerName: 'Lakshmi Devi', rmId: 'RM-20260726-0006' },
    { batchCode: 'BC-20260727-0007', produce: 'Gongura', weight: 7.2, stage: 'powdering', isPowdered: false, rawKg: 85, farmerName: 'Anji Reddy', rmId: 'RM-20260726-0007' },
    { batchCode: 'BC-20260727-0008', produce: 'Tomato', weight: 6.76, stage: 'powdering', isPowdered: false, rawKg: 98, farmerName: 'Lakshmi Devi', rmId: 'RM-20260726-0008' },
    { batchCode: 'BC-20260728-0001', produce: 'Tomato', weight: 11.22, stage: 'powdering', isPowdered: false, rawKg: 160, farmerName: 'Lakshmi Devi', rmId: 'RM-20260727-0001' },
    { batchCode: 'BC-20260728-0002', produce: 'Tomato', weight: 4.96, stage: 'powdering', isPowdered: false, rawKg: 72, farmerName: 'Lakshmi Devi', rmId: 'RM-20260727-0002' },
    { batchCode: 'BC-20260728-0003', produce: 'Tomato', weight: 11.88, stage: 'powdering', isPowdered: false, rawKg: 170, farmerName: 'Lakshmi Devi', rmId: 'RM-20260727-0003' },
    { batchCode: 'BC-20260728-0004', produce: 'Tomato', weight: 12.5, stage: 'powdering', isPowdered: false, rawKg: 180, farmerName: 'Lakshmi Devi', rmId: 'RM-20260727-0004' },
    { batchCode: 'BC-20260805-0001', produce: 'Beetroot', weight: 2.1, stage: 'packing', isPowdered: true, preSieved: 2.2, rawKg: 30, farmerName: 'Venkat Rao', rmId: 'RM-20260804-0001' },
    { batchCode: 'BC-20260805-0002', produce: 'Beetroot', weight: 5.3, stage: 'packing', isPowdered: true, preSieved: 5.5, rawKg: 75, farmerName: 'Venkat Rao', rmId: 'RM-20260804-0002' },
    { batchCode: 'BC-20260926-0001', produce: 'Rice', weight: 19.26, stage: 'powdering', isPowdered: false, claimed: true, preSieved: 19.26, rawKg: 25, farmerName: 'Anji Reddy', rmId: 'RM-20260925-0001', sievingStart: '2026-09-26T22:32:00Z' },
    { batchCode: 'BC-20261006-0001', produce: 'Dehydrated Amla', weight: 10.5, stage: 'packing', isPowdered: true, preSieved: 10.8, rawKg: 110, farmerName: 'Venkat Rao', rmId: 'RM-20261005-0001', sievingStart: '2026-10-08T20:56:00Z', powderedAt: '2026-10-08T21:03:00Z' }
  ];

  screenshotBatches.forEach(sb => {
    if (!store.batches.some(b => b.batchCode === sb.batchCode)) {
      store.batches.push({
        _id: `btc_${sb.batchCode.replace(/[^a-zA-Z0-9]/g, '_')}`,
        batchCode: sb.batchCode,
        produce: sb.produce,
        rmIds: [sb.rmId],
        currentStage: sb.stage as any,
        sorting: {
          rawWeightKg: sb.rawKg,
          sortedWeightKg: sb.rawKg * 0.95,
          rejectionWeightKg: sb.rawKg * 0.05,
          rejectionRatePercent: 5.0,
          sortedAt: new Date('2026-07-25T08:00:00Z'),
          sortedBy: 'Sunitha Bai (Grading Lead)',
          notes: 'Standard optical sorting and defect elimination.'
        },
        dehydration: {
          dryerId: 'EQP-D01',
          shift: 'Morning Shift',
          tempC: 58,
          fanSpeed: 'High',
          preProcessSteps: ['Food-Grade Bubble Wash', '3mm Slicing'],
          preDryWeightKg: sb.rawKg * 0.95,
          postDryWeightKg: sb.weight,
          yieldPercent: parseFloat(((sb.weight / (sb.rawKg * 0.95)) * 100).toFixed(1)),
          labourCost: 1200,
          startedAt: new Date('2026-07-25T10:00:00Z'),
          completedAt: new Date('2026-07-25T22:00:00Z'),
          operator: 'Raju Goud (Chamber Operator)',
          notes: 'Consistent moisture reduction down to safe shelf-stable 4.5%.'
        },
        powdering: {
          isPowdered: sb.isPowdered,
          claimedForPowdering: sb.claimed || sb.isPowdered,
          preSievedWeightKg: sb.preSieved || sb.weight,
          powderedWeightKg: sb.isPowdered ? sb.weight : 0,
          meshSize: '80 Mesh Standard',
          lossWeightKg: sb.preSieved ? Math.max(0, parseFloat((sb.preSieved - sb.weight).toFixed(2))) : 0,
          sievingStartedAt: sb.sievingStart ? new Date(sb.sievingStart) : undefined,
          powderedAt: sb.powderedAt ? new Date(sb.powderedAt) : undefined,
          operator: 'Praveen Kumar (Milling Tech)',
          notes: sb.isPowdered ? 'Sieved with standard stainless 80-mesh vibro-sifter.' : ''
        },
        packing: {
          outputId: '',
          skuName: '',
          packWeightGm: 2000,
          channel: 'B2B',
          totalPacksProduced: 0,
          totalFinishedKg: sb.weight,
          packagingCost: 0,
          lotNumber: `LOT-${sb.batchCode.slice(3, 7)}`
        },
        dispatch: {
          destination: 'Finished Goods Bay',
          qualitySignOff: false,
          dispatchedPacks: 0,
          status: 'pending_qc'
        },
        totalRawKg: sb.rawKg,
        totalFinishedKg: sb.weight,
        remainingKg: sb.weight,
        totalBatchCost: sb.rawKg * 35,
        status: 'active',
        createdAt: new Date('2026-07-24T06:00:00Z')
      } as any);

      // Ensure matching RM Receipt
      if (!store.receipts.some(r => r.rmId === sb.rmId)) {
        store.receipts.push({
          _id: `rcp_${sb.rmId}`,
          rmId: sb.rmId,
          farmerId: sb.farmerName.includes('Lakshmi') ? 'frm_3' : sb.farmerName.includes('Venkat') ? 'frm_2' : 'frm_1',
          farmerName: sb.farmerName,
          produce: sb.produce,
          initialWeightKg: sb.rawKg,
          receiptDate: new Date('2026-07-24T06:00:00Z'),
          farmLocation: sb.farmerName.includes('Lakshmi') ? 'Nereducharla, Nalgonda' : sb.farmerName.includes('Venkat') ? 'Kathevaram, Suryapet' : 'Thonda, Suryapet',
          modeOfTransport: 'Mini Farm Truck',
          transportCost: 1500,
          ratePerKg: 32,
          totalProduceCost: sb.rawKg * 32,
          landedCostTotal: sb.rawKg * 32 + 1500,
          landedCostPerKg: parseFloat(((sb.rawKg * 32 + 1500) / sb.rawKg).toFixed(2)),
          paymentStatus: 'paid',
          status: 'in_batch',
          batchCode: sb.batchCode,
          gatePassNo: `GP-${sb.rmId.slice(3)}`,
          weighbridgeSlipNo: `WB-${Math.floor(1000 + Math.random() * 9000)}`
        } as any);
      }
    }
  });

  // Packages (Traceable Finished Goods)
  if (!store.packages || store.packages.length === 0) {
    store.packages = [
      {
        _id: 'pkg_1',
        outputId: 'OP-20261011-01',
        productId: 'OP-20261011-01',
        skuId: 'sku_mor_2kg',
        skuName: 'Pure Green Moringa Leaf Powder (2kg Bulk Pack)',
        skuSize: '2kg',
        skuSizeKg: 2,
        channel: 'Amazon FBA / B2B',
        totalPacksProduced: 66,
        totalFinishedKg: 132.8,
        weightReturnedKg: 0.8,
        lotNumber: 'LOT-MOR-2610-01',
        expiryDate: new Date('2028-10-12'),
        packedAt: new Date('2026-10-12T14:00:00Z'),
        packedBy: 'Kavitha Reddy (Packaging Line Supervisor)',
        sourceBatches: [
          {
            batchCode: 'BC-20261011-01',
            produce: 'Moringa',
            quantityUsedKg: 132.8,
            isPowdered: true,
            remainingKg: 0
          }
        ],
        dispatch: {
          destination: 'Amazon FBA Fulfilment Center, Hyderabad',
          vehicleNo: 'TS 08 UB 4120',
          dispatchedBy: 'Srinivas Rao (Warehouse Incharge)',
          qcInspector: 'Mahesh Varma (QA Director)',
          qcInspectionDate: new Date('2026-10-13T10:00:00Z'),
          dispatchDate: new Date('2026-10-13T16:30:00Z'),
          status: 'delivered',
          gatePassNo: 'GP-20261013-004',
          invoiceNo: 'INV-KOH-2610-091'
        },
        notes: '100% farm-direct pure leaf micronized powder packed under food-grade nitrogen barrier seal.',
        createdAt: new Date('2026-10-12T14:00:00Z')
      },
      {
        _id: 'pkg_2',
        outputId: 'OP-20261012-01',
        productId: 'OP-20261012-01',
        skuId: 'sku_blend_4kg',
        skuName: 'Wild Amla & Ruby Beetroot Bioactive Blend (4kg Master Pack)',
        skuSize: '4kg',
        skuSizeKg: 4,
        channel: 'B2B (Bulk Food Service / Exports)',
        totalPacksProduced: 4,
        totalFinishedKg: 16.0,
        weightReturnedKg: 0.0,
        lotNumber: 'LOT-AML-BEE-2610',
        expiryDate: new Date('2028-10-14'),
        packedAt: new Date('2026-10-14T02:00:00Z'),
        packedBy: 'Kavitha Reddy (Packaging Line Supervisor)',
        sourceBatches: [
          {
            batchCode: 'BC-20260727-0002',
            produce: 'Dehydrated Amla',
            quantityUsedKg: 10.0,
            isPowdered: true,
            remainingKg: 0
          },
          {
            batchCode: 'BC-20260805-0002',
            produce: 'Beetroot',
            quantityUsedKg: 6.0,
            isPowdered: true,
            remainingKg: 0
          }
        ],
        dispatch: {
          destination: 'Blinkit Dark Store Hub, Madhapur',
          vehicleNo: 'TS 09 EA 8812',
          dispatchedBy: 'Srinivas Rao (Warehouse Incharge)',
          qcInspector: 'Mahesh Varma (QA Director)',
          qcInspectionDate: new Date('2026-10-14T02:00:00Z'),
          dispatchDate: new Date('2026-10-14T08:00:00Z'),
          status: 'dispatched',
          gatePassNo: 'GP-20261014-001',
          invoiceNo: 'INV-KOH-2610-105'
        },
        notes: 'Formulation blend: 62.5% Wild Amla Powder + 37.5% Beetroot Powder.',
        createdAt: new Date('2026-10-14T02:00:00Z')
      },
      {
        _id: 'pkg_3',
        outputId: 'OP-20261014-01',
        productId: 'OP-20261014-01',
        skuId: 'sku_tom_6kg',
        skuName: 'Sun-Dried Tomato & Gongura Culinary Powder (6kg Industrial Pack)',
        skuSize: '6kg',
        skuSizeKg: 6,
        channel: 'B2B (Commercial Kitchens & HORECA)',
        totalPacksProduced: 3,
        totalFinishedKg: 18.0,
        weightReturnedKg: 0.0,
        lotNumber: 'LOT-TOM-GON-2610',
        expiryDate: new Date('2027-11-20'),
        packedAt: new Date('2026-10-14T10:00:00Z'),
        packedBy: 'Kavitha Reddy (Packaging Line Supervisor)',
        sourceBatches: [
          {
            batchCode: 'BC-20260725-0001',
            produce: 'Tomato',
            quantityUsedKg: 12.0,
            isPowdered: true,
            remainingKg: 7.6
          },
          {
            batchCode: 'BC-20260727-0007',
            produce: 'Gongura',
            quantityUsedKg: 6.0,
            isPowdered: true,
            remainingKg: 1.2
          }
        ],
        dispatch: {
          destination: 'Taj Deccan Hotel & Resorts Culinary Division',
          vehicleNo: 'TS 07 UA 1190',
          dispatchedBy: 'Srinivas Rao (Warehouse Incharge)',
          qcInspector: 'Mahesh Varma (QA Director)',
          qcInspectionDate: new Date('2026-10-14T11:00:00Z'),
          dispatchDate: new Date('2026-10-14T14:30:00Z'),
          status: 'delivered',
          gatePassNo: 'GP-20261014-009',
          invoiceNo: 'INV-KOH-2610-112'
        },
        notes: 'High tang heritage savory powder formulated for culinary sauces and seasoning rubs.',
        createdAt: new Date('2026-10-14T10:00:00Z')
      }
    ];
  }

  // 2. SKUs Catalog
  if (!store.skus || store.skus.length === 0) {
    store.skus = [
      {
        _id: 'sku_mor_100',
        skuCode: 'KOH-MOR-100G',
        name: 'Pure Green Moringa Leaf Powder 100g',
        category: 'Single Ingredient Powders',
        produceSource: 'Moringa',
        packWeightGm: 100,
        mrp: 299,
        sellingPrice: 249,
        rawMaterialCost: 45,
        labourCost: 20,
        packagingCost: 15,
        cogs: 80,
        grossMarginPercent: 67.87,
        currentStock: 1420,
        reorderThreshold: 300,
        platforms: { amazon: true, blinkit: true, d2c: true, b2b: true, instamart: true, zepto: true },
        fssaiLicenseNumber: '13622014000345',
        status: 'active'
      },
      {
        _id: 'sku_aml_100',
        skuCode: 'KOH-AML-100G',
        name: 'Wild Amla Bioactive C Powder 100g',
        category: 'Single Ingredient Powders',
        produceSource: 'Amla',
        packWeightGm: 100,
        mrp: 349,
        sellingPrice: 299,
        rawMaterialCost: 60,
        labourCost: 25,
        packagingCost: 18,
        cogs: 103,
        grossMarginPercent: 65.55,
        currentStock: 890,
        reorderThreshold: 250,
        platforms: { amazon: true, blinkit: true, d2c: true, b2b: true, instamart: true, zepto: false },
        fssaiLicenseNumber: '13622014000345',
        status: 'active'
      },
      {
        _id: 'sku_car_50',
        skuCode: 'KOH-CAR-50G',
        name: 'Crispy Sweet Carrot Crunchies 50g',
        category: 'Clean Label Snacks',
        produceSource: 'Sweet Carrot',
        packWeightGm: 50,
        mrp: 199,
        sellingPrice: 179,
        rawMaterialCost: 35,
        labourCost: 18,
        packagingCost: 12,
        cogs: 65,
        grossMarginPercent: 63.69,
        currentStock: 320,
        reorderThreshold: 200,
        platforms: { amazon: true, blinkit: true, d2c: true, b2b: false, instamart: true, zepto: true },
        fssaiLicenseNumber: '13622014000345',
        status: 'low_stock'
      },
      {
        _id: 'sku_bee_80',
        skuCode: 'KOH-BEE-80G',
        name: 'Solar Dried Beetroot Flakes 80g',
        category: 'Superfood Flakes',
        produceSource: 'Beetroot',
        packWeightGm: 80,
        mrp: 249,
        sellingPrice: 219,
        rawMaterialCost: 40,
        labourCost: 22,
        packagingCost: 14,
        cogs: 76,
        grossMarginPercent: 65.3,
        currentStock: 650,
        reorderThreshold: 150,
        platforms: { amazon: true, blinkit: false, d2c: true, b2b: true, instamart: false, zepto: false },
        fssaiLicenseNumber: '13622014000345',
        status: 'active'
      },
      {
        _id: 'sku_gon_75',
        skuCode: 'KOH-GON-75G',
        name: 'Sun-Cured Gongura Leaf Powder 75g',
        category: 'Heritage Greens',
        produceSource: 'Gongura',
        packWeightGm: 75,
        mrp: 229,
        sellingPrice: 199,
        rawMaterialCost: 30,
        labourCost: 18,
        packagingCost: 12,
        cogs: 60,
        grossMarginPercent: 69.85,
        currentStock: 480,
        reorderThreshold: 120,
        platforms: { amazon: false, blinkit: true, d2c: true, b2b: true, instamart: false, zepto: false },
        fssaiLicenseNumber: '13622014000345',
        status: 'active'
      },
      {
        _id: 'sku_cur_60',
        skuCode: 'KOH-CUR-60G',
        name: 'Aromatic Curry Leaf Infusion Powder 60g',
        category: 'Heritage Greens',
        produceSource: 'Curry Leaf',
        packWeightGm: 60,
        mrp: 219,
        sellingPrice: 189,
        rawMaterialCost: 28,
        labourCost: 16,
        packagingCost: 12,
        cogs: 56,
        grossMarginPercent: 70.37,
        currentStock: 540,
        reorderThreshold: 150,
        platforms: { amazon: true, blinkit: true, d2c: true, b2b: false, instamart: false, zepto: false },
        fssaiLicenseNumber: '13622014000345',
        status: 'active'
      },
      {
        _id: 'sku_gin_100',
        skuCode: 'KOH-GIN-100G',
        name: 'High-Gingerol Sun Dried Ginger Powder 100g',
        category: 'Single Ingredient Powders',
        produceSource: 'Ginger',
        packWeightGm: 100,
        mrp: 299,
        sellingPrice: 269,
        rawMaterialCost: 55,
        labourCost: 22,
        packagingCost: 16,
        cogs: 93,
        grossMarginPercent: 65.43,
        currentStock: 410,
        reorderThreshold: 150,
        platforms: { amazon: true, blinkit: false, d2c: true, b2b: true, instamart: false, zepto: false },
        fssaiLicenseNumber: '13622014000345',
        status: 'active'
      }
    ];
  }

  // 3. Compliance & NABL Lab Tests
  if (!store.complianceTests || store.complianceTests.length === 0) {
    store.complianceTests = [
      {
        _id: 'cmp_1',
        skuId: 'sku_mor_100',
        skuName: 'Pure Green Moringa Leaf Powder 100g',
        testType: 'FSSAI Full Nutritional & Heavy Metal Assay',
        batchCode: 'BC-20261011-01',
        labName: 'Eurofins Analytical Services India (NABL Accredited)',
        testDate: new Date('2026-10-02'),
        expiryDate: new Date('2027-04-02'),
        retestFrequencyMonths: 6,
        reportUrl: 'https://reports.kohfoods.com/eurofins-mor-2610.pdf',
        status: 'valid',
        parameterResults: [
          { parameter: 'Moisture', value: '4.2%', standardLimit: '< 6.0%', passed: true },
          { parameter: 'Lead (Pb)', value: '< 0.05 mg/kg', standardLimit: '< 2.5 mg/kg', passed: true },
          { parameter: 'Cadmium (Cd)', value: '< 0.02 mg/kg', standardLimit: '< 1.5 mg/kg', passed: true },
          { parameter: 'Salmonella per 25g', value: 'Absent', standardLimit: 'Absent', passed: true },
          { parameter: 'E. coli per g', value: 'Absent', standardLimit: '< 10 CFU/g', passed: true }
        ],
        verifiedBy: 'Dr. K. Sharma (QA Director)',
        notes: 'Compliant with FSSAI regulations 2011 and export specifications.'
      },
      {
        _id: 'cmp_2',
        skuId: 'sku_aml_100',
        skuName: 'Wild Amla Bioactive C Powder 100g',
        testType: 'Ascorbic Acid HPLC Assay & Bioactive Profiling',
        batchCode: 'BC-20261012-02',
        labName: 'SGS India Testing Labs (NABL ISO 17025)',
        testDate: new Date('2026-09-28'),
        expiryDate: new Date('2027-03-28'),
        retestFrequencyMonths: 6,
        reportUrl: 'https://reports.kohfoods.com/sgs-amla-ascorbic-2609.pdf',
        status: 'valid',
        parameterResults: [
          { parameter: 'Ascorbic Acid (Vitamin C)', value: '2,450 mg/100g', standardLimit: '> 1,800 mg/100g', passed: true },
          { parameter: 'Total Polyphenols', value: '8.4%', standardLimit: '> 6.0%', passed: true },
          { parameter: 'Moisture', value: '4.8%', standardLimit: '< 6.0%', passed: true },
          { parameter: 'Arsenic (As)', value: 'BDL (<0.01 mg/kg)', standardLimit: '< 1.1 mg/kg', passed: true }
        ],
        verifiedBy: 'Dr. K. Sharma (QA Director)',
        notes: 'Exceptional retention. Validates vacuum drying protocol.'
      },
      {
        _id: 'cmp_3',
        skuId: 'sku_car_50',
        skuName: 'Crispy Sweet Carrot Crunchies 50g',
        testType: 'Microbiology & Water Activity (aw) Screen',
        batchCode: 'BC-20261013-01',
        labName: 'TUV SUD South Asia',
        testDate: new Date('2026-09-15'),
        expiryDate: new Date('2027-05-15'),
        retestFrequencyMonths: 8,
        reportUrl: 'https://reports.kohfoods.com/tuv-carrot-aw-2609.pdf',
        status: 'valid',
        parameterResults: [
          { parameter: 'Water Activity (aw)', value: '0.28', standardLimit: '< 0.50', passed: true },
          { parameter: 'Residual Moisture', value: '3.8%', standardLimit: '< 5.0%', passed: true },
          { parameter: 'Total Plate Count', value: '180 CFU/g', standardLimit: '< 10,000 CFU/g', passed: true },
          { parameter: 'Yeast & Mould', value: '< 10 CFU/g', standardLimit: '< 100 CFU/g', passed: true }
        ],
        verifiedBy: 'Mahesh Varma (QC Inspector)',
        notes: 'Low water activity guarantees 12-month ambient shelf life without preservatives.'
      }
    ];
  }

  // 4. NPD (New Product Development) Pipeline
  if (!store.npdProducts || store.npdProducts.length === 0) {
    store.npdProducts = [
      {
        _id: 'npd_1',
        title: 'Crispy Sweet Potato Crunchies',
        concept: 'Low-glycemic alternative to deep-fried potato chips. Clean-label dehydration with sea salt and cold-pressed cold coconut oil mist.',
        category: 'Clean Label Snacks',
        surplusCrop: 'Sweet Potato',
        originatingSignal: 'Chevella cluster farmers reported 18 tons of orange-flesh sweet potato surplus.',
        stage: 'Commercial Trial',
        demandValidation: {
          marketSizeEstimate: '₹45 Cr / year in urban tier-1 snacking',
          competitorBrands: ['Too Yumm', 'The Whole Truth', 'BRB'],
          recommendedPriceRange: '₹179 - ₹199',
          consumerTarget: 'Mothers seeking wholesome lunchbox snacks and fitness enthusiasts',
          isApproved: true
        },
        labTrial: {
          formulationNotes: '2.5mm crinkle slice blanched at 82°C for 45s, vacuum-dried at 54°C for 14 hours. Golden crisp with zero burnt edges.',
          dehydrationTempC: 54,
          tasteScore: 8.8,
          textureScore: 9.2,
          yieldObservedPercent: 12.4,
          recipeLocked: true
        },
        commercialTrial: {
          batchTrialCode: 'BT-SWP-001',
          trialYieldKg: 62.0,
          pilotPacksProduced: 250,
          fssaiReportUrl: 'https://reports.kohfoods.com/fssai-npd-swp-trial.pdf',
          compliancePassed: true
        },
        targetMrp: 199,
        estimatedCogs: 62,
        estimatedGrossMarginPercent: 68.84,
        createdSkuCode: 'KOH-SWP-50G',
        createdAt: new Date('2026-08-15'),
        updatedAt: new Date('2026-10-10')
      },
      {
        _id: 'npd_2',
        title: 'Bioactive Jamun Freeze-Dry Powder',
        concept: 'Targeted diabetic-friendly metabolic superfood preserving anthocyanins and jamboline alkaloid from indigenous black plum.',
        category: 'Targeted Wellness',
        surplusCrop: 'Wild Jamun',
        originatingSignal: 'Telangana Forest Dept collection center offered wild-harvested forest Jamun.',
        stage: 'Lab Trial',
        demandValidation: {
          marketSizeEstimate: '₹80 Cr / year in Ayurvedic diabetic support',
          competitorBrands: ['Kapiva', 'Baidyanath', 'Organic India'],
          recommendedPriceRange: '₹349 - ₹399',
          consumerTarget: 'Pre-diabetic and type-2 adults looking for natural insulin sensitizers',
          isApproved: true
        },
        labTrial: {
          formulationNotes: 'Pulp separation at 12°C. Low temperature dehydration at 48°C. HPLC confirms 96% anthocyanin retention.',
          dehydrationTempC: 48,
          tasteScore: 8.4,
          textureScore: 8.6,
          yieldObservedPercent: 7.2,
          recipeLocked: false
        },
        commercialTrial: {
          trialYieldKg: 0,
          pilotPacksProduced: 0,
          compliancePassed: false
        },
        targetMrp: 399,
        estimatedCogs: 110,
        estimatedGrossMarginPercent: 72.43,
        createdAt: new Date('2026-09-01'),
        updatedAt: new Date('2026-10-08')
      },
      {
        _id: 'npd_3',
        title: 'Cold-Dehydrated Raw Honey Amla Chews',
        concept: 'Kid-safe clean alternative to gelatin Vitamin C gummies. Slices of wild amla steeped in raw multiflora honey and dehydrated.',
        category: 'Functional Treats',
        surplusCrop: 'Amla',
        originatingSignal: 'Customer feedback survey requested a natural immunity candy for school children.',
        stage: 'Demand Validation',
        demandValidation: {
          marketSizeEstimate: '₹120 Cr / year in pediatric immunity confectionery',
          competitorBrands: ['Nutrilite Kids', 'Power Gummies', 'Zingavita'],
          recommendedPriceRange: '₹249 - ₹299',
          consumerTarget: 'Children aged 4-14 and health-conscious parents',
          isApproved: true
        },
        labTrial: {
          formulationNotes: 'Initial honey osmoconcentration trial running in Pilot Lab Chamber.',
          dehydrationTempC: 50,
          tasteScore: 8.0,
          textureScore: 7.8,
          yieldObservedPercent: 28.0,
          recipeLocked: false
        },
        commercialTrial: {
          trialYieldKg: 0,
          pilotPacksProduced: 0,
          compliancePassed: false
        },
        targetMrp: 279,
        estimatedCogs: 85,
        estimatedGrossMarginPercent: 69.53,
        createdAt: new Date('2026-09-20'),
        updatedAt: new Date('2026-10-12')
      }
    ];
  }

  // 5. Monthly P&L Ledger (Finance)
  if (!store.pnlEntries || store.pnlEntries.length === 0) {
    store.pnlEntries = [
      {
        _id: 'pnl_2026_08',
        month: '2026-08',
        revenue: { d2c: 650000, amazon: 720000, blinkit: 330000, b2b: 150000, exports: 0, totalRevenue: 1850000 },
        cogs: { rawMaterialProcurement: 320000, processingLabour: 140000, packagingCost: 130000, factoryUtilities: 90000, totalCogs: 680000 },
        grossProfit: 1170000,
        grossMarginPercent: 63.24,
        operatingExpenses: {
          marketingAdsMeta: 210000, marketingAdsGoogle: 85000, marketingAdsAmazon: 95000, influencerCollabs: 65000,
          contentProduction: 45000, teamSalaries: 140000, factoryRent: 45000, logisticsAndShipping: 35000,
          paymentGatewayFees: 12000, fbaAndQuickCommerceFees: 18000, rtoAndDamageCost: 8000, softwareAndCloud: 12000,
          legalAndInsurance: 5000, travelAndAdmin: 10000, depreciation: 0, interestAndFinance: 0, totalOpex: 785000
        },
        ebitda: 385000,
        ebitdaMarginPercent: 20.81,
        netProfit: 315000,
        netMarginPercent: 17.03,
        notes: 'August harvest ramp. Launch of Blinkit quick commerce in Hyderabad.',
        isLocked: true
      },
      {
        _id: 'pnl_2026_09',
        month: '2026-09',
        revenue: { d2c: 840000, amazon: 910000, blinkit: 420000, b2b: 170000, exports: 0, totalRevenue: 2340000 },
        cogs: { rawMaterialProcurement: 400000, processingLabour: 170000, packagingCost: 160000, factoryUtilities: 110000, totalCogs: 840000 },
        grossProfit: 1500000,
        grossMarginPercent: 64.1,
        operatingExpenses: {
          marketingAdsMeta: 260000, marketingAdsGoogle: 105000, marketingAdsAmazon: 115000, influencerCollabs: 85000,
          contentProduction: 55000, teamSalaries: 145000, factoryRent: 45000, logisticsAndShipping: 42000,
          paymentGatewayFees: 16000, fbaAndQuickCommerceFees: 24000, rtoAndDamageCost: 9000, softwareAndCloud: 14000,
          legalAndInsurance: 5000, travelAndAdmin: 20000, depreciation: 0, interestAndFinance: 0, totalOpex: 940000
        },
        ebitda: 560000,
        ebitdaMarginPercent: 23.93,
        netProfit: 465000,
        netMarginPercent: 19.87,
        notes: '26% top-line growth driven by Meta video ads and repeat D2C subscribers.',
        isLocked: true
      },
      {
        _id: 'pnl_2026_10',
        month: '2026-10',
        revenue: { d2c: 1050000, amazon: 1120000, blinkit: 540000, b2b: 180000, exports: 0, totalRevenue: 2890000 },
        cogs: { rawMaterialProcurement: 480000, processingLabour: 210000, packagingCost: 195000, factoryUtilities: 125000, totalCogs: 1010000 },
        grossProfit: 1880000,
        grossMarginPercent: 65.05,
        operatingExpenses: {
          marketingAdsMeta: 310000, marketingAdsGoogle: 125000, marketingAdsAmazon: 140000, influencerCollabs: 95000,
          contentProduction: 65000, teamSalaries: 160000, factoryRent: 45000, logisticsAndShipping: 52000,
          paymentGatewayFees: 21000, fbaAndQuickCommerceFees: 32000, rtoAndDamageCost: 11000, softwareAndCloud: 14000,
          legalAndInsurance: 5000, travelAndAdmin: 45000, depreciation: 0, interestAndFinance: 0, totalOpex: 1120000
        },
        ebitda: 760000,
        ebitdaMarginPercent: 26.3,
        netProfit: 630000,
        netMarginPercent: 21.8,
        notes: 'Current month forecast with Diwali festive gift packs and Amazon Great Indian Festival surge.',
        isLocked: false
      }
    ];
  }

  // 6. Factory Workers
  if (!store.workers || store.workers.length === 0) {
    store.workers = [
      { _id: 'wkr_1', name: 'Raju Goud', role: 'Dehydration Operator', dailyRate: 550, otMultiplier: 1.5, active: true, createdAt: new Date('2026-01-10') },
      { _id: 'wkr_2', name: 'Sunitha Bai', role: 'Sorting Specialist', dailyRate: 450, otMultiplier: 1.5, active: true, createdAt: new Date('2026-01-10') },
      { _id: 'wkr_3', name: 'Praveen Kumar', role: 'Milling & Pulverization Technician', dailyRate: 500, otMultiplier: 1.5, active: true, createdAt: new Date('2026-01-15') },
      { _id: 'wkr_4', name: 'Kavitha Reddy', role: 'Packaging Line Supervisor', dailyRate: 500, otMultiplier: 1.5, active: true, createdAt: new Date('2026-01-20') },
      { _id: 'wkr_5', name: 'Mahesh Varma', role: 'QC Inspector & Sample Analyst', dailyRate: 600, otMultiplier: 1.5, active: true, createdAt: new Date('2026-02-01') },
      { _id: 'wkr_6', name: 'Srinivas Rao', role: 'Material Inward & Warehouse Incharge', dailyRate: 480, otMultiplier: 1.5, active: true, createdAt: new Date('2026-02-05') }
    ];
  }

  // 7. Attendance Logs
  if (!store.attendanceLogs || store.attendanceLogs.length === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    store.attendanceLogs = [
      { _id: 'att_1', workerId: 'wkr_1', workerName: 'Raju Goud', date: todayStr, shift: 'Morning Shift', checkIn: new Date(todayStr + 'T07:02:00Z'), checkOut: null, hoursWorked: null, status: 'present', createdAt: new Date() },
      { _id: 'att_2', workerId: 'wkr_2', workerName: 'Sunitha Bai', date: todayStr, shift: 'Morning Shift', checkIn: new Date(todayStr + 'T07:05:00Z'), checkOut: null, hoursWorked: null, status: 'present', createdAt: new Date() },
      { _id: 'att_3', workerId: 'wkr_3', workerName: 'Praveen Kumar', date: todayStr, shift: 'Morning Shift', checkIn: new Date(todayStr + 'T07:15:00Z'), checkOut: null, hoursWorked: null, status: 'present', createdAt: new Date() },
      { _id: 'att_4', workerId: 'wkr_4', workerName: 'Kavitha Reddy', date: todayStr, shift: 'Morning Shift', checkIn: new Date(todayStr + 'T07:00:00Z'), checkOut: null, hoursWorked: null, status: 'present', createdAt: new Date() },
      { _id: 'att_5', workerId: 'wkr_5', workerName: 'Mahesh Varma', date: todayStr, shift: 'Morning Shift', checkIn: new Date(todayStr + 'T07:30:00Z'), checkOut: null, hoursWorked: null, status: 'present', createdAt: new Date() },
      { _id: 'att_6', workerId: 'wkr_6', workerName: 'Srinivas Rao', date: todayStr, shift: 'Morning Shift', checkIn: new Date(todayStr + 'T06:55:00Z'), checkOut: null, hoursWorked: null, status: 'present', createdAt: new Date() }
    ];
  }

  // 8. Factory Equipment
  if (!store.equipment || store.equipment.length === 0) {
    store.equipment = [
      {
        _id: 'eqp_1',
        code: 'EQP-D01',
        name: 'Commercial Vacuum Chamber Dehydrator A1',
        category: 'Dehydrator',
        status: 'active',
        powerKw: 18.5,
        capacityPerHrKg: 250,
        tempC: 58,
        airflowLevel: 85,
        healthScorePercent: 96,
        activeLoadKg: 210,
        currentBatch: 'BC-20261012-02',
        notes: 'Operates at 58°C with sub-atmospheric vacuum retention. Clean filter.',
        updatedAt: new Date()
      },
      {
        _id: 'eqp_2',
        code: 'EQP-D02',
        name: 'Multi-Tier Solar-Convective Dryer B1',
        category: 'Dehydrator',
        status: 'active',
        powerKw: 12.0,
        capacityPerHrKg: 180,
        tempC: 54,
        airflowLevel: 90,
        healthScorePercent: 92,
        activeLoadKg: 160,
        currentBatch: 'BC-20261013-01',
        notes: 'Solar heat exchanger with auxiliary electric heater. Optimum carrot drying.',
        updatedAt: new Date()
      },
      {
        _id: 'eqp_3',
        code: 'EQP-M01',
        name: 'Food-Grade Stainless Micro-Pulverizer M1',
        category: 'Milling',
        status: 'active',
        powerKw: 7.5,
        capacityPerHrKg: 120,
        healthScorePercent: 98,
        activeLoadKg: 85,
        notes: 'Equipped with cold-air jacket to protect heat-labile plant vitamins.',
        updatedAt: new Date()
      },
      {
        _id: 'eqp_4',
        code: 'EQP-P01',
        name: 'Automatic Nitrogen-Flush Pouch Sealing Line P1',
        category: 'Packaging',
        status: 'active',
        powerKw: 4.5,
        capacityPerHrKg: 45,
        healthScorePercent: 94,
        activeLoadKg: 35,
        notes: 'Residual oxygen levels held consistently below 0.8% under MAP flush.',
        updatedAt: new Date()
      },
      {
        _id: 'eqp_5',
        code: 'EQP-W01',
        name: 'Industrial Triple-Stage Vegetable Bubble Washer W1',
        category: 'Sorting',
        status: 'active',
        powerKw: 5.0,
        capacityPerHrKg: 500,
        healthScorePercent: 95,
        activeLoadKg: 400,
        notes: 'Ozonated water injection eliminates 99.9% surface microbes without chemical wash.',
        updatedAt: new Date()
      }
    ];
  }

  // 9. Crop Processing Parameters
  if (!store.cropProcessing || store.cropProcessing.length === 0) {
    store.cropProcessing = [
      {
        _id: 'proc_mor',
        cropName: 'Moringa',
        washTimeMin: 8,
        sliceThicknessMm: 'Whole Leaf (Destemmed)',
        blanchingTempC: 0,
        dehydrationTempC: 55,
        dehydrationDurationHours: 12,
        targetMoisturePercent: 4.5,
        yieldPercent: 8.0,
        millingMeshSize: '120 Mesh',
        laborHoursPerTon: 14,
        notes: 'Zero blanching to prevent thermal breakdown of isothiocyanates.'
      },
      {
        _id: 'proc_aml',
        cropName: 'Amla',
        washTimeMin: 12,
        sliceThicknessMm: '4mm Segment Slice',
        blanchingTempC: 75,
        dehydrationTempC: 58,
        dehydrationDurationHours: 16,
        targetMoisturePercent: 5.0,
        yieldPercent: 11.0,
        millingMeshSize: '100 Mesh',
        laborHoursPerTon: 18,
        notes: 'Flash blanching inactivates polyphenol oxidase, keeping natural yellow-gold hue.'
      },
      {
        _id: 'proc_car',
        cropName: 'Sweet Carrot',
        washTimeMin: 10,
        sliceThicknessMm: '3mm Fluted Wavy Disc',
        blanchingTempC: 80,
        dehydrationTempC: 54,
        dehydrationDurationHours: 14,
        targetMoisturePercent: 4.0,
        yieldPercent: 9.0,
        millingMeshSize: 'Snack Cut',
        laborHoursPerTon: 16,
        notes: 'Slight blanching caramelizes natural sugars for crisp snack texture.'
      },
      {
        _id: 'proc_bee',
        cropName: 'Beetroot',
        washTimeMin: 12,
        sliceThicknessMm: '2.5mm Julienne Flakes',
        blanchingTempC: 0,
        dehydrationTempC: 56,
        dehydrationDurationHours: 15,
        targetMoisturePercent: 4.5,
        yieldPercent: 9.0,
        millingMeshSize: 'Flakes',
        laborHoursPerTon: 15,
        notes: 'Direct dehydrator loading to maintain high betalain antioxidant density.'
      },
      {
        _id: 'proc_cur',
        cropName: 'Curry Leaf',
        washTimeMin: 6,
        sliceThicknessMm: 'Whole Leaf',
        blanchingTempC: 0,
        dehydrationTempC: 50,
        dehydrationDurationHours: 10,
        targetMoisturePercent: 4.0,
        yieldPercent: 18.0,
        millingMeshSize: '80 Mesh',
        laborHoursPerTon: 12,
        notes: 'Low heat preserves essential aromatic oils (caryophyllene and pinene).'
      }
    ];
  }

  // 10. Shift Schedules
  if (!store.shiftSchedules || store.shiftSchedules.length === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    store.shiftSchedules = [
      {
        _id: 'sch_1',
        shiftCode: `SCH-${todayStr}-M`,
        shiftName: 'Morning Production Shift',
        shiftDate: todayStr,
        supervisorName: 'Ramesh Kumar',
        assignedOperators: ['Raju Goud', 'Sunitha Bai', 'Praveen Kumar', 'Kavitha Reddy'],
        assignedEquipment: ['EQP-D01', 'EQP-D02', 'EQP-W01'],
        scheduledBatches: ['BC-20261012-02', 'BC-20261013-01'],
        targetProcessingKg: 1200,
        actualProcessingKg: 1150,
        targetOutputKg: 135,
        actualOutputKg: 98,
        status: 'active',
        notes: 'Running dehydration run on Sweet Carrot and finishing Amla jar packaging.'
      },
      {
        _id: 'sch_2',
        shiftCode: `SCH-${todayStr}-E`,
        shiftName: 'Evening Finishing Shift',
        shiftDate: todayStr,
        supervisorName: 'Shivam Singh',
        assignedOperators: ['Raju Goud', 'Kavitha Reddy'],
        assignedEquipment: ['EQP-P01'],
        scheduledBatches: ['BC-20261014-01'],
        targetProcessingKg: 800,
        actualProcessingKg: 0,
        targetOutputKg: 95,
        actualOutputKg: 0,
        status: 'scheduled',
        notes: 'Scheduled for nitrogen-flushed pouch sealing and case carton packing.'
      }
    ];
  }

  // 11. Shift Setups (Standard Line Profiles)
  if (!store.shiftSetups || store.shiftSetups.length === 0) {
    store.shiftSetups = [
      {
        _id: 'setup_morn',
        name: 'Morning Full Shift (07:00 - 15:30)',
        hours: '07:00 - 15:30',
        durationHours: 8,
        breakDurationMin: 30,
        equipmentLines: ['Bubble Washer W1', 'Chamber Dehydrator A1', 'Solar Dryer B1'],
        manpowerCount: 8,
        skilledRoles: ['Chamber Operator', 'Grading Lead', 'Milling Tech'],
        maxIntakeCapacityKg: 1500,
        targetOEEPercent: 88,
        airflowLevelTarget: 85,
        tempTargetC: 58
      },
      {
        _id: 'setup_eve',
        name: 'Evening Finishing Shift (15:30 - 23:30)',
        hours: '15:30 - 23:30',
        durationHours: 8,
        breakDurationMin: 30,
        equipmentLines: ['Pulverizer M1', 'Automatic Pouch Line P1'],
        manpowerCount: 6,
        skilledRoles: ['Packaging Operator', 'QC Inspector'],
        maxIntakeCapacityKg: 1000,
        targetOEEPercent: 85,
        airflowLevelTarget: 80,
        tempTargetC: 55
      },
      {
        _id: 'setup_night',
        name: 'Night Conditioning Shift (23:30 - 07:00)',
        hours: '23:30 - 07:00',
        durationHours: 7.5,
        breakDurationMin: 30,
        equipmentLines: ['Solar Dryer B1 (Automated Moisture Cycle)'],
        manpowerCount: 3,
        skilledRoles: ['Night Monitoring Operator'],
        maxIntakeCapacityKg: 600,
        targetOEEPercent: 82,
        airflowLevelTarget: 75,
        tempTargetC: 52
      }
    ];
  }

  // 12. Payments Ledger
  if (!store.payments || store.payments.length === 0) {
    store.payments = [
      {
        _id: 'pay_1',
        referenceId: 'PAY-FRM-0082',
        recipientType: 'farmer',
        recipientName: 'Venkat Rao',
        category: 'Raw Material Procurement',
        detail: 'Amla & Turmeric Q3 Harvest advance disbursement',
        amount: 125000,
        dueDate: '2026-10-18',
        status: 'pending',
        ageDays: 6,
        notes: 'Agreed 50% advance for Suryapet cluster procurement.',
        createdAt: new Date('2026-10-08')
      },
      {
        _id: 'pay_2',
        referenceId: 'PAY-VND-0104',
        recipientType: 'vendor',
        recipientName: 'PrintPack Solutions Pvt Ltd',
        category: 'Packaging Supplies',
        detail: '15,000x Kraft Standup Pouches (PO-20260301-001)',
        amount: 67500,
        dueDate: '2026-10-25',
        status: 'pending',
        ageDays: 12,
        notes: 'Invoice INV-PP-2026-402 under Net 30 terms.',
        createdAt: new Date('2026-10-02')
      },
      {
        _id: 'pay_3',
        referenceId: 'PAY-INF-0019',
        recipientType: 'influencer',
        recipientName: 'Pooja Makhija (Plant Chef)',
        category: 'Creator Marketing',
        detail: 'Completed Morning Moringa Reel (42k views, 6.1x ROAS)',
        amount: 5000,
        dueDate: '2026-09-22',
        paidDate: '2026-09-26',
        paymentMode: 'UPI',
        utrRef: 'AXIS987123450091',
        status: 'paid',
        ageDays: 0,
        notes: 'Invoice INV-PM-019 cleared via Axis Bank UPI.',
        createdAt: new Date('2026-09-22')
      },
      {
        _id: 'pay_4',
        referenceId: 'PAY-VND-0089',
        recipientType: 'vendor',
        recipientName: 'Deccan Containers & Jars',
        category: 'Packaging Supplies',
        detail: '5,000x PET Hexagon Jars & Induction Wads',
        amount: 70000,
        dueDate: '2026-09-15',
        status: 'overdue',
        ageDays: 29,
        notes: 'Net 15 expired. High priority payment required before next delivery.',
        createdAt: new Date('2026-09-01')
      },
      {
        _id: 'pay_5',
        referenceId: 'PAY-VND-0056',
        recipientType: 'vendor',
        recipientName: 'Apex Machine Spare Parts',
        category: 'Factory Maintenance',
        detail: 'Food-Grade Silicone Dryer Tray Liners (APX-7821)',
        amount: 25000,
        dueDate: '2026-09-10',
        paidDate: '2026-09-12',
        paymentMode: 'NEFT',
        utrRef: 'HDFC002981745610',
        status: 'paid',
        ageDays: 0,
        notes: 'Installed in Chamber Dryers A1 & B1.',
        createdAt: new Date('2026-09-10')
      }
    ];
  }

  // 13. Expense Vouchers
  if (!store.expenses || store.expenses.length === 0) {
    store.expenses = [
      {
        _id: 'exp_1',
        voucherNo: 'VCH-2026-0142',
        person: 'Ramesh Kumar',
        submittedBy: 'Ramesh Kumar',
        date: '2026-10-08',
        category: 'Materials',
        amount: 14200,
        description: 'Replacement of HEPA air filters & chamber door silicone gasket seals.',
        status: 'approved',
        reimbursementStatus: 'complete',
        billImageKey: 'bill_hepa_filter_oct.jpg',
        createdAt: new Date('2026-10-08')
      },
      {
        _id: 'exp_2',
        voucherNo: 'VCH-2026-0158',
        person: 'Dr. K. Srinivas',
        submittedBy: 'Dr. K. Srinivas',
        date: '2026-10-10',
        category: 'Travel',
        amount: 6800,
        description: 'Agronomy field cluster audit & soil moisture inspection in Suryapet & Nalgonda.',
        status: 'approved',
        reimbursementStatus: 'complete',
        billImageKey: 'toll_fuel_suryapet.pdf',
        createdAt: new Date('2026-10-10')
      },
      {
        _id: 'exp_3',
        voucherNo: 'VCH-2026-0171',
        person: 'Mahesh Varma',
        submittedBy: 'Mahesh Varma',
        date: '2026-10-12',
        category: 'Miscellaneous',
        amount: 8500,
        description: 'Eurofins sample transport courier & expedited laboratory processing fee.',
        status: 'approved',
        reimbursementStatus: 'pending',
        billImageKey: 'courier_lab_receipt.jpg',
        createdAt: new Date('2026-10-12')
      },
      {
        _id: 'exp_4',
        voucherNo: 'VCH-2026-0185',
        person: 'Shivam Singh',
        submittedBy: 'Shivam Singh',
        date: '2026-10-13',
        category: 'Office supplies',
        amount: 4300,
        description: 'Thermal transfer label ribbon cartridges for batch packaging barcode printer.',
        status: 'pending',
        reimbursementStatus: 'pending',
        billImageKey: 'ribbon_cartridge_bill.jpg',
        createdAt: new Date('2026-10-13')
      }
    ];
  }

  // 14. Packaging Labels & Regulatory Artwork
  if (!store.packaging || store.packaging.length === 0) {
    store.packaging = [
      {
        _id: 'pkg_1',
        skuName: 'Pure Green Moringa Leaf Powder 100g',
        skuCode: 'KOH-MOR-100G',
        country: 'India',
        version: 'v2.1',
        status: 'approved',
        packagingType: 'Standup Zipper Pouch',
        fssaiNumber: '13622014000345',
        netWeight: '100g',
        regulatoryStandard: 'FSSAI Food Safety & Standards Regulations 2011',
        barcode: '8906012480012',
        artworkUrl: 'https://cdn.kohfoods.com/packaging/moringa_100g_india_v2.1.pdf',
        nutritionPanelVerified: true,
        allergensDeclared: 'None. Free from gluten, dairy, and nuts.',
        shelfLifeMonths: 18,
        notes: 'Green-gold aesthetic with clear moisture barrier window.',
        updatedAt: new Date('2026-10-05')
      },
      {
        _id: 'pkg_2',
        skuName: 'Wild Amla Bioactive Powder 100g',
        skuCode: 'KOH-AML-100G',
        country: 'India',
        version: 'v1.4',
        status: 'approved',
        packagingType: 'Hexagon PET Jar + Induction Seal',
        fssaiNumber: '13622014000345',
        netWeight: '100g',
        regulatoryStandard: 'FSSAI Food Safety Standards',
        barcode: '8906012480029',
        artworkUrl: 'https://cdn.kohfoods.com/packaging/amla_100g_jar_india_v1.4.pdf',
        nutritionPanelVerified: true,
        allergensDeclared: 'None',
        shelfLifeMonths: 24,
        notes: 'Amber jar design with gold foil typography highlighting 2,450mg Vitamin C.',
        updatedAt: new Date('2026-10-06')
      },
      {
        _id: 'pkg_3',
        skuName: 'Crispy Sweet Carrot Crunchies 50g',
        skuCode: 'KOH-CAR-50G',
        country: 'India',
        version: 'v1.0',
        status: 'approved',
        packagingType: 'Matte Nitrogen-Flushed Foil Pouch',
        fssaiNumber: '13622014000345',
        netWeight: '50g',
        regulatoryStandard: 'FSSAI Clean Label Guidelines',
        barcode: '8906012480036',
        artworkUrl: 'https://cdn.kohfoods.com/packaging/carrot_crunchies_50g_v1.0.pdf',
        nutritionPanelVerified: true,
        allergensDeclared: 'None. Zero added oil or preservatives.',
        shelfLifeMonths: 12,
        notes: 'Features crunch soundwave graphic and 100% natural callout.',
        updatedAt: new Date('2026-10-08')
      },
      {
        _id: 'pkg_4',
        skuName: 'Organic Wild Amla Bioactive Powder 100g',
        skuCode: 'KOH-AML-100G-US',
        country: 'USA',
        version: 'v1.0',
        status: 'review',
        packagingType: 'Standup Barrier Pouch',
        netWeight: '3.53 oz (100g)',
        regulatoryStandard: 'US FDA 21 CFR Part 101 Food Labeling',
        barcode: '8906012480104',
        artworkUrl: 'https://cdn.kohfoods.com/packaging/amla_usa_export_v1.0.pdf',
        nutritionPanelVerified: true,
        allergensDeclared: 'Major 9 Food Allergens: None present.',
        shelfLifeMonths: 24,
        notes: 'FDA nutrition facts panel format verified with US import attorney.',
        updatedAt: new Date('2026-10-10')
      },
      {
        _id: 'pkg_5',
        skuName: 'Pure Green Moringa Leaf Powder 100g',
        skuCode: 'KOH-MOR-100G-UAE',
        country: 'UAE',
        version: 'v1.0',
        status: 'review',
        packagingType: 'Standup Zipper Pouch',
        netWeight: '100g',
        regulatoryStandard: 'ESMA UAE.S GSO 9 / Halal Certification',
        barcode: '8906012480203',
        artworkUrl: 'https://cdn.kohfoods.com/packaging/moringa_uae_arabic_v1.0.pdf',
        nutritionPanelVerified: true,
        allergensDeclared: 'None',
        shelfLifeMonths: 18,
        notes: 'Dual Arabic and English nutrition panel with Halal logo.',
        updatedAt: new Date('2026-10-11')
      }
    ];
  }

  // 15. B2B Leads
  if (!store.b2bLeads || store.b2bLeads.length === 0) {
    store.b2bLeads = [
      {
        _id: 'b2b_1',
        name: 'NatureBasket Organic Superstores',
        type: 'Premium Retail Chain',
        stage: 'negotiation',
        city: 'Mumbai',
        state: 'Maharashtra',
        contactPerson: 'Rajesh Nair (Category Head - Health Foods)',
        phone: '+91 98201 99882',
        email: 'rajesh.nair@naturebasket.co.in',
        gst: '27AABCN8877E1ZX',
        address: 'Godrej One, Pirojshanagar, Vikhroli East, Mumbai 400079',
        estimatedValue: 1200000,
        creditLimit: 500000,
        paymentTerms: 'Net 30',
        samplesSent: [
          { item: 'Moringa 100g Pouch', date: '2026-09-15', feedback: 'Passed sensory review with 9/10 score.' },
          { item: 'Amla Bioactive 100g Jar', date: '2026-09-15', feedback: 'Approved for 18 flagship store shelves.' }
        ],
        notes: 'Contract draft sent. Finalizing listing fees and margin spread.',
        createdAt: new Date('2026-09-01'),
        updatedAt: new Date('2026-10-09')
      },
      {
        _id: 'b2b_2',
        name: 'Apollo Pharmacy Wellness Division',
        type: 'National Pharmacy Chain',
        stage: 'sample_sent',
        city: 'Hyderabad',
        state: 'Telangana',
        contactPerson: 'Dr. Priya Rao',
        phone: '+91 98490 33441',
        email: 'priyarao@apollopharmacy.org',
        gst: '36AAACA1234F1ZU',
        address: 'Ali Towers, Greams Road, Chennai / Begumpet Hub',
        estimatedValue: 2400000,
        creditLimit: 1000000,
        paymentTerms: 'Net 45',
        samplesSent: [
          { item: 'Moringa Powder 100g', date: '2026-10-02' },
          { item: 'Amla Bioactive 100g', date: '2026-10-02' },
          { item: 'Eurofins Heavy Metal Reports', date: '2026-10-02' }
        ],
        notes: 'QA team reviewing clean-label certificates for placement in 120 wellness counters.',
        createdAt: new Date('2026-09-20'),
        updatedAt: new Date('2026-10-11')
      },
      {
        _id: 'b2b_3',
        name: 'Dubai Green Foods Trading LLC',
        type: 'International Export Distributor',
        stage: 'won',
        city: 'Dubai',
        state: 'United Arab Emirates',
        contactPerson: 'Tariq Al-Mansoor',
        phone: '+971 50 123 4567',
        email: 'tariq@dubaigreenfoods.ae',
        address: 'Warehouse 14, Al Quoz Industrial Area 3, Dubai',
        estimatedValue: 3500000,
        creditLimit: 1500000,
        paymentTerms: '50% Advance, 50% Against BL',
        samplesSent: [
          { item: 'Bulk Moringa Powder 5kg Drum', date: '2026-08-20', feedback: 'Approved for GCC import.' }
        ],
        notes: 'Contract signed. First export order PO-DGF-2026-001 currently in production.',
        createdAt: new Date('2026-08-10'),
        updatedAt: new Date('2026-10-05')
      },
      {
        _id: 'b2b_4',
        name: 'Urban Grocers Artisanal Marts',
        type: 'Gourmet Supermarket',
        stage: 'won',
        city: 'Bengaluru',
        state: 'Karnataka',
        contactPerson: 'Sunita Hegde',
        phone: '+91 99001 22334',
        email: 'procurement@urbangrocers.in',
        gst: '29AAACU7788P1Z0',
        address: '100ft Road, Indiranagar, Bengaluru 560038',
        estimatedValue: 800000,
        creditLimit: 300000,
        paymentTerms: 'Net 15',
        samplesSent: [
          { item: 'Full Superfood Range Kit', date: '2026-09-05', feedback: 'Fast shelf rotation reported.' }
        ],
        notes: 'Repeat client with fortnightly replenishment orders.',
        createdAt: new Date('2026-08-25'),
        updatedAt: new Date('2026-10-08')
      }
    ];
  }

  // 16. B2B Orders
  if (!store.b2bOrders || store.b2bOrders.length === 0) {
    store.b2bOrders = [
      {
        _id: 'ord_1',
        clientId: 'b2b_3',
        clientName: 'Dubai Green Foods Trading LLC',
        orderNumber: 'PO-DGF-2026-001',
        items: [
          { skuName: 'Bulk Moringa Leaf Powder (Food Grade 120 Mesh)', quantityKg: 2000, ratePerKg: 250, total: 500000 },
          { skuName: 'Bulk Wild Amla Bioactive Powder', quantityKg: 1000, ratePerKg: 350, total: 350000 }
        ],
        totalAmount: 850000,
        orderDate: '2026-09-28',
        deliveryDueDate: '2026-11-15',
        status: 'processing',
        paymentStatus: 'partial',
        paidAmount: 425000,
        notes: '50% advance wire received. Export phytosanitary inspection scheduled for Nov 2.',
        createdAt: new Date('2026-09-28')
      },
      {
        _id: 'ord_2',
        clientId: 'b2b_4',
        clientName: 'Urban Grocers Artisanal Marts',
        orderNumber: 'ORD-UG-26-88',
        items: [
          { skuName: 'Pure Green Moringa Leaf Powder 100g', quantityKg: 50, ratePerKg: 1800, total: 90000 },
          { skuName: 'Crispy Sweet Carrot Crunchies 50g', quantityKg: 25, ratePerKg: 3000, total: 75000 }
        ],
        totalAmount: 165000,
        orderDate: '2026-10-04',
        deliveryDueDate: '2026-10-10',
        status: 'delivered',
        paymentStatus: 'paid',
        paidAmount: 165000,
        notes: 'Delivered in full via SafeExpress logistics. Payment settled via NEFT.',
        createdAt: new Date('2026-10-04')
      },
      {
        _id: 'ord_3',
        clientId: 'b2b_1',
        clientName: 'NatureBasket Organic Superstores',
        orderNumber: 'ORD-NB-26-104',
        items: [
          { skuName: 'Wild Amla Bioactive Powder 100g', quantityKg: 100, ratePerKg: 2100, total: 210000 },
          { skuName: 'Solar Dried Beetroot Flakes 80g', quantityKg: 64, ratePerKg: 1718, total: 110000 }
        ],
        totalAmount: 320000,
        orderDate: '2026-10-11',
        deliveryDueDate: '2026-10-22',
        status: 'confirmed',
        paymentStatus: 'partial',
        paidAmount: 150000,
        notes: 'Initial listing stock for 18 Mumbai & Pune stores.',
        createdAt: new Date('2026-10-11')
      }
    ];
  }

  // 17. Static Graphic Assets
  if (!store.statics || store.statics.length === 0) {
    store.statics = [
      {
        _id: 'stat_1',
        title: 'Clean Label Transparency Infographic',
        stage: 'approved',
        type: 'Infographic',
        platform: 'Meta / Instagram',
        owner: 'Pooja',
        dueDate: '2026-10-18',
        assetLink: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
        dimensions: '1080x1080',
        notes: 'Compares koh! zero-chemical vacuum drying with commercial spray-dried maltodextrin powders.',
        createdAt: new Date('2026-10-05')
      },
      {
        _id: 'stat_2',
        title: 'Amla vs Orange: 20x More Vitamin C Chart',
        stage: 'approved',
        type: 'Comparison Chart',
        platform: 'LinkedIn',
        owner: 'Pooja',
        dueDate: '2026-10-16',
        assetLink: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
        dimensions: '1200x628',
        notes: 'B2B food-tech infographic citing HPLC assays.',
        createdAt: new Date('2026-10-06')
      },
      {
        _id: 'stat_3',
        title: 'Vacuum Dehydration Heat Curve Comparison',
        stage: 'review',
        type: 'Technical Diagram',
        platform: 'LinkedIn',
        owner: 'Keerthi',
        dueDate: '2026-10-20',
        assetLink: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
        dimensions: '1200x628',
        notes: 'Shows ascorbic acid thermal preservation at 58°C vs 90°C degradation.',
        createdAt: new Date('2026-10-08')
      }
    ];
  }

  // 18. Ad Creatives
  if (!store.adCreatives || store.adCreatives.length === 0) {
    store.adCreatives = [
      {
        _id: 'adcr_1',
        title: 'Amla Pure Gold Reel - The Vitamin C Story',
        stage: 'pushed',
        channel: 'Meta',
        creativeType: 'Video',
        objective: 'Conversions',
        owner: 'Pooja',
        dueDate: '2026-10-12',
        scriptSnippet: 'Hook: "If you think your multivitamin gives you real Vitamin C, watch this lab test..."',
        hookType: 'Curiosity / Lab Proof',
        assetUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fruits-falling-into-water-41221-large.mp4',
        notes: 'Top performing conversion creative on Meta (4.2x ROAS).',
        createdAt: new Date('2026-10-01')
      },
      {
        _id: 'adcr_2',
        title: 'Sweet Carrot Crunch ASMR Sound Bite',
        stage: 'pushed',
        channel: 'Meta',
        creativeType: 'Video',
        objective: 'Traffic',
        owner: 'Rohini',
        dueDate: '2026-10-14',
        scriptSnippet: 'Zero refined oils. Just 3mm dehydrated carrots with incredible crunch.',
        hookType: 'Sensory ASMR',
        assetUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chips-falling-on-a-table-41148-large.mp4',
        notes: 'High CTR traffic magnet for snack bundles.',
        createdAt: new Date('2026-10-03')
      },
      {
        _id: 'adcr_3',
        title: 'Why Doctors Recommend Cold-Dehydrated Moringa',
        stage: 'ready',
        channel: 'Google',
        creativeType: 'Static',
        objective: 'Conversions',
        owner: 'Pooja',
        dueDate: '2026-10-19',
        scriptSnippet: '94% enzyme retention without harsh chemical spray drying.',
        hookType: 'Authority / Medical Endorsement',
        assetUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
        notes: 'Approved for Google Performance Max campaigns.',
        createdAt: new Date('2026-10-07')
      }
    ];
  }

  // 19. Paid Ads Campaigns
  if (!store.paidAds || store.paidAds.length === 0) {
    store.paidAds = [
      {
        _id: 'pad_1',
        campaignName: 'Meta Conversions - Pure Amla & Moringa Superfood Pack',
        channel: 'Meta',
        status: 'Active',
        dailyBudget: 4000,
        totalSpend: 185000,
        roas: 4.22,
        clicks: 24500,
        conversions: 1840,
        cpa: 100.54,
        cpc: 7.55,
        startDate: '2026-09-01'
      },
      {
        _id: 'pad_2',
        campaignName: 'Amazon Sponsored Brands - Clean Superfood Powders',
        channel: 'Amazon',
        status: 'Active',
        dailyBudget: 3500,
        totalSpend: 142000,
        roas: 4.54,
        clicks: 18200,
        conversions: 1320,
        cpa: 107.57,
        cpc: 7.8,
        startDate: '2026-09-05'
      },
      {
        _id: 'pad_3',
        campaignName: 'Meta Retargeting - Cart Abandoners 15% Off',
        channel: 'Meta',
        status: 'Active',
        dailyBudget: 1500,
        totalSpend: 62000,
        roas: 5.61,
        clicks: 7400,
        conversions: 890,
        cpa: 69.66,
        cpc: 8.37,
        startDate: '2026-09-10'
      }
    ];
  }

  // 20. Content Items
  if (!store.contentItems || store.contentItems.length === 0) {
    store.contentItems = [
      {
        _id: 'cnt_1',
        title: 'From Suryapet Farms to Your Morning Smoothie: The Moringa Story',
        pillar: 'Made With Care',
        stage: 'Published',
        format: 'Video / Reel',
        targetSkuId: 'sku_mor_100',
        targetSkuName: 'Pure Green Moringa Leaf Powder 100g',
        clipIds: ['sht_clip_1', 'sht_clip_3'],
        hookText: 'Did you know 90% of commercial moringa is sun-dried on open tarps exposed to dust?',
        scriptText: 'Full origin documentary following farmer Anji Reddy and our zero-dust vacuum dehydration line.',
        assignedTo: 'Rohini',
        channel: 'Instagram',
        scheduledDate: new Date('2026-10-10'),
        publishedDate: new Date('2026-10-10'),
        postUrl: 'https://instagram.com/p/reel_moringa_story',
        boostCandidate: true,
        performance: { views: 76000, likes: 5800, shares: 1200, comments: 210, roas: 4.8 },
        createdAt: new Date('2026-09-25')
      },
      {
        _id: 'cnt_2',
        title: '5-Minute Morning Electrolyte & Vitamin C Tonic with Wild Amla',
        pillar: '5-Minute Nutrition',
        stage: 'Published',
        format: 'Reel',
        targetSkuId: 'sku_aml_100',
        targetSkuName: 'Wild Amla Bioactive C Powder 100g',
        clipIds: ['sht_clip_2'],
        hookText: 'Stop drinking sugary sports drinks. Here is pure plant fuel in 30 seconds.',
        scriptText: '1 tsp Wild Amla powder, raw forest honey, pinch of Himalayan rock salt, sparkling water.',
        assignedTo: 'Rohini',
        channel: 'Instagram',
        scheduledDate: new Date('2026-10-12'),
        publishedDate: new Date('2026-10-12'),
        postUrl: 'https://instagram.com/p/amla_tonic',
        boostCandidate: true,
        performance: { views: 64000, likes: 4900, shares: 1850, comments: 190, roas: 4.2 },
        createdAt: new Date('2026-09-28')
      },
      {
        _id: 'cnt_3',
        title: 'The Science of Vacuum Dehydration: Why Heat Destroys Plant Enzymes',
        pillar: 'Clean Label Transparency',
        stage: 'Scheduled',
        format: 'Article / Carousel',
        targetSkuId: 'sku_mor_100',
        targetSkuName: 'Pure Green Moringa Leaf Powder 100g',
        clipIds: ['sht_clip_4'],
        hookText: 'Why 80% of active plant nutrients are lost before you even open the package.',
        scriptText: 'Detailed breakdown of enzyme denaturation kinetics above 60°C.',
        assignedTo: 'Keerthi',
        channel: 'LinkedIn',
        scheduledDate: new Date('2026-10-16'),
        boostCandidate: false,
        performance: { views: 0, likes: 0, shares: 0, comments: 0 },
        createdAt: new Date('2026-10-02')
      }
    ];
  }

  // 21. Audit & Activity Logs
  if (!store.activityLogs || store.activityLogs.length === 0) {
    store.activityLogs = [
      {
        _id: 'act_log_1',
        module: 'Production',
        action: 'complete',
        title: 'Batch BC-20261011-01 Dispatched',
        description: 'Completed 1,328 packs of 100g Moringa Powder dispatched to Amazon FBA Hyderabad.',
        entityId: 'btc_1',
        userName: 'Mahesh Varma',
        timestamp: new Date('2026-10-13T16:35:00Z')
      },
      {
        _id: 'act_log_2',
        module: 'Procurement',
        action: 'create',
        title: 'Raw Material Delivery Logged',
        description: 'Received 750 kg Beetroot from Narsimha Yadav (Jangaon cluster).',
        entityId: 'rm_105',
        userName: 'Shivam Singh',
        timestamp: new Date('2026-10-14T01:15:00Z')
      },
      {
        _id: 'act_log_3',
        module: 'Quality Assurance',
        action: 'approve',
        title: 'Eurofins NABL Assay Signed Off',
        description: 'Wild Amla Lot LOT-AML-2610-02 passed ascorbic acid & zero heavy metal screen.',
        entityId: 'cmp_2',
        userName: 'Dr. K. Sharma',
        timestamp: new Date('2026-10-14T02:00:00Z')
      }
    ];
  }
};
