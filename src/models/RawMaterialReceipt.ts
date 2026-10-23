import mongoose, { Schema, Document } from 'mongoose';

export interface IRawMaterialReceipt extends Document {
  rmId: string; // e.g. RM-20260918-0001
  farmerId: string;
  farmerName: string;
  produce: string;
  initialWeightKg: number;
  receiptDate: Date;
  farmLocation: string;
  modeOfTransport: string;
  transportCost: number;
  ratePerKg: number;
  totalProduceCost: number;
  landedCostTotal: number; // totalProduceCost + transportCost
  landedCostPerKg: number; // landedCostTotal / initialWeightKg
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentDate?: Date;
  status: 'received' | 'sorted' | 'in_batch' | 'dispatched';
  batchCode?: string;
  notes?: string;
  createdAt: Date;
}

const RawMaterialReceiptSchema = new Schema<IRawMaterialReceipt>({
  rmId: { type: String, required: true, unique: true },
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  produce: { type: String, required: true },
  initialWeightKg: { type: Number, required: true },
  receiptDate: { type: Date, default: Date.now },
  farmLocation: { type: String, default: 'Hyderabad' },
  modeOfTransport: { type: String, default: 'Mini Truck / Auto' },
  transportCost: { type: Number, default: 0 },
  ratePerKg: { type: Number, default: 35 },
  totalProduceCost: { type: Number, default: 0 },
  landedCostTotal: { type: Number, default: 0 },
  landedCostPerKg: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  paymentDate: { type: Date },
  status: { type: String, enum: ['received', 'sorted', 'in_batch', 'dispatched'], default: 'received' },
  batchCode: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const RawMaterialReceipt = mongoose.models.RawMaterialReceipt || mongoose.model<IRawMaterialReceipt>('RawMaterialReceipt', RawMaterialReceiptSchema);
