import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
  farmerCode: string;
  name: string;
  village: string;
  district: string;
  phone: string;
  plotAcres: number;
  crops: string[];
  status: 'active' | 'prospect' | 'paused';
  fpoLink?: string;
  bankDetails?: {
    accountNo?: string;
    ifsc?: string;
    bankName?: string;
  };
  createdAt: Date;
}

const FarmerSchema = new Schema<IFarmer>({
  farmerCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  village: { type: String, required: true },
  district: { type: String, default: 'Telangana / AP' },
  phone: { type: String, required: true },
  plotAcres: { type: Number, default: 1 },
  crops: [{ type: String }],
  status: { type: String, enum: ['active', 'prospect', 'paused'], default: 'active' },
  fpoLink: { type: String, default: 'Self / Direct' },
  bankDetails: {
    accountNo: String,
    ifsc: String,
    bankName: String,
  },
  createdAt: { type: Date, default: Date.now }
});

export const Farmer = mongoose.models.Farmer || mongoose.model<IFarmer>('Farmer', FarmerSchema);
