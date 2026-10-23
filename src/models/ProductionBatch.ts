import mongoose, { Schema, Document } from 'mongoose';

export interface ISortingStage {
  rawWeightKg: number;
  sortedWeightKg: number;
  rejectionWeightKg: number;
  rejectionRatePercent: number;
  sortedAt?: Date;
  sortedBy?: string;
  notes?: string;
}

export interface IDehydrationStage {
  dryerId: string;
  shift: 'Morning (6am-2pm)' | 'Evening (2pm-10pm)' | 'Night (10pm-6am)';
  tempC: number;
  fanSpeed: string;
  preProcessSteps: string[]; // e.g. ['Washing', 'Slicing 3mm', 'Blanching']
  preDryWeightKg: number;
  postDryWeightKg: number;
  yieldPercent: number; // (postDry / preDry) * 100
  labourCost: number;
  utilityCost?: number;
  startedAt?: Date;
  completedAt?: Date;
  operator?: string;
  notes?: string;
}

export interface IPowderingStage {
  isPowdered: boolean;
  preSievedWeightKg: number;
  powderedWeightKg: number;
  meshSize: string;
  lossWeightKg: number;
  claimedForPowdering?: boolean;
  sievingStartedAt?: Date;
  powderedAt?: Date;
  operator?: string;
  notes?: string;
}

export interface IPackingStage {
  outputId: string; // e.g. OP-20260918-01
  skuId?: string;
  skuName: string;
  packWeightGm: number;
  channel: 'B2C (Retail/D2C)' | 'B2B (Bulk/Export)';
  totalPacksProduced: number;
  totalFinishedKg: number;
  packagingCost: number;
  packedAt?: Date;
  packedBy?: string;
  lotNumber: string;
  bestBefore: Date;
  notes?: string;
}

export interface IDispatchStage {
  destination: string;
  vehicleNo?: string;
  driverContact?: string;
  qualitySignOff: boolean;
  qcInspector?: string;
  qcInspectionDate?: Date;
  qcReportUrl?: string;
  dispatchDate?: Date;
  dispatchedPacks: number;
  status: 'pending_qc' | 'qc_approved' | 'dispatched' | 'delivered';
  notes?: string;
}

export interface IProductionBatch extends Document {
  batchCode: string; // e.g. BC-20260918-01
  produce: string;
  rmIds: string[];
  currentStage: 'receiving' | 'sorting' | 'dehydration' | 'powdering' | 'packing' | 'dispatch' | 'completed';
  sorting: ISortingStage;
  dehydration: IDehydrationStage;
  powdering: IPowderingStage;
  packing: IPackingStage;
  dispatch: IDispatchStage;
  totalRawKg: number;
  totalFinishedKg: number;
  remainingKg?: number;
  totalBatchCost: number;
  status: 'active' | 'stalled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ProductionBatchSchema = new Schema<IProductionBatch>({
  batchCode: { type: String, required: true, unique: true },
  produce: { type: String, required: true },
  rmIds: [{ type: String }],
  currentStage: {
    type: String,
    enum: ['receiving', 'sorting', 'dehydration', 'powdering', 'packing', 'dispatch', 'completed'],
    default: 'sorting'
  },
  sorting: {
    rawWeightKg: { type: Number, default: 0 },
    sortedWeightKg: { type: Number, default: 0 },
    rejectionWeightKg: { type: Number, default: 0 },
    rejectionRatePercent: { type: Number, default: 0 },
    sortedAt: { type: Date },
    sortedBy: { type: String, default: 'Supervisor' },
    notes: { type: String }
  },
  dehydration: {
    dryerId: { type: String, default: 'Dryer A1' },
    shift: { type: String, default: 'Morning (6am-2pm)' },
    tempC: { type: Number, default: 58 },
    fanSpeed: { type: String, default: 'Level 4 (High)' },
    preProcessSteps: [{ type: String }],
    preDryWeightKg: { type: Number, default: 0 },
    postDryWeightKg: { type: Number, default: 0 },
    yieldPercent: { type: Number, default: 0 },
    labourCost: { type: Number, default: 0 },
    utilityCost: { type: Number, default: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    operator: { type: String },
    notes: { type: String }
  },
  powdering: {
    isPowdered: { type: Boolean, default: false },
    preSievedWeightKg: { type: Number, default: 0 },
    powderedWeightKg: { type: Number, default: 0 },
    meshSize: { type: String, default: '80 Mesh' },
    lossWeightKg: { type: Number, default: 0 },
    claimedForPowdering: { type: Boolean, default: false },
    sievingStartedAt: { type: Date },
    powderedAt: { type: Date },
    operator: { type: String },
    notes: { type: String }
  },
  packing: {
    outputId: { type: String, default: '' },
    skuId: { type: String },
    skuName: { type: String, default: '' },
    packWeightGm: { type: Number, default: 100 },
    channel: { type: String, default: 'B2C (Retail/D2C)' },
    totalPacksProduced: { type: Number, default: 0 },
    totalFinishedKg: { type: Number, default: 0 },
    packagingCost: { type: Number, default: 0 },
    packedAt: { type: Date },
    packedBy: { type: String },
    lotNumber: { type: String, default: '' },
    bestBefore: { type: Date },
    notes: { type: String }
  },
  dispatch: {
    destination: { type: String, default: '' },
    vehicleNo: { type: String },
    driverContact: { type: String },
    qualitySignOff: { type: Boolean, default: false },
    qcInspector: { type: String },
    qcInspectionDate: { type: Date },
    qcReportUrl: { type: String },
    dispatchDate: { type: Date },
    dispatchedPacks: { type: Number, default: 0 },
    status: { type: String, enum: ['pending_qc', 'qc_approved', 'dispatched', 'delivered'], default: 'pending_qc' },
    notes: { type: String }
  },
  totalRawKg: { type: Number, default: 0 },
  totalFinishedKg: { type: Number, default: 0 },
  remainingKg: { type: Number, default: 0 },
  totalBatchCost: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'stalled', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ProductionBatch = mongoose.models.ProductionBatch || mongoose.model<IProductionBatch>('ProductionBatch', ProductionBatchSchema);
