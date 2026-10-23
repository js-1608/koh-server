import mongoose, { Schema, Document } from 'mongoose';

export interface ICropMaster extends Document {
  cropName: string;
  category: 'Vegetable' | 'Fruit' | 'Herb' | 'Leafy' | 'Root';
  daysToHarvest: number;
  freshYieldPerAcreKg: number;
  dehydrationYieldPercent: number; // e.g., 7.5% -> 100kg fresh = 7.5kg dehydrated
  costPerAcreBreakdown: {
    seeds: number;
    inputs: number;
    labour: number;
    transport: number;
  };
  totalEstimatedCostPerAcre: number;
  marketRatePerKg: number;
}

const CropMasterSchema = new Schema<ICropMaster>({
  cropName: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Vegetable', 'Fruit', 'Herb', 'Leafy', 'Root'], default: 'Vegetable' },
  daysToHarvest: { type: Number, required: true },
  freshYieldPerAcreKg: { type: Number, required: true },
  dehydrationYieldPercent: { type: Number, required: true },
  costPerAcreBreakdown: {
    seeds: { type: Number, default: 0 },
    inputs: { type: Number, default: 0 },
    labour: { type: Number, default: 0 },
    transport: { type: Number, default: 0 }
  },
  totalEstimatedCostPerAcre: { type: Number, default: 0 },
  marketRatePerKg: { type: Number, default: 25 }
});

export const CropMaster = mongoose.models.CropMaster || mongoose.model<ICropMaster>('CropMaster', CropMasterSchema);
