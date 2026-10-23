import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmPurchase {
  item: string;
  category: 'Seeds' | 'Inputs/Fertilizers' | 'Labour' | 'Transport' | 'Equipment';
  amount: number;
  date: Date;
  receiptUrl?: string;
}

export interface ICropCycle extends Document {
  cycleCode: string;
  farmerId: string;
  farmerName: string;
  cropId: string;
  cropName: string;
  plotAcres: number;
  sowingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  estimatedYieldKg: number;
  actualYieldKg?: number;
  status: 'planned' | 'growing' | 'harvested' | 'delayed';
  farmPurchases: IFarmPurchase[];
  totalCultivationCost: number;
  notes?: string;
  createdAt: Date;
}

const CropCycleSchema = new Schema<ICropCycle>({
  cycleCode: { type: String, required: true, unique: true },
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  cropId: { type: String, required: true },
  cropName: { type: String, required: true },
  plotAcres: { type: Number, required: true, default: 1 },
  sowingDate: { type: Date, required: true },
  expectedHarvestDate: { type: Date, required: true },
  actualHarvestDate: { type: Date },
  estimatedYieldKg: { type: Number, required: true },
  actualYieldKg: { type: Number, default: 0 },
  status: { type: String, enum: ['planned', 'growing', 'harvested', 'delayed'], default: 'growing' },
  farmPurchases: [{
    item: String,
    category: { type: String, enum: ['Seeds', 'Inputs/Fertilizers', 'Labour', 'Transport', 'Equipment'] },
    amount: Number,
    date: { type: Date, default: Date.now },
    receiptUrl: String
  }],
  totalCultivationCost: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const CropCycle = mongoose.models.CropCycle || mongoose.model<ICropCycle>('CropCycle', CropCycleSchema);
