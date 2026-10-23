import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceTest extends Document {
  skuId: string;
  skuName: string;
  testType: 'FSSAI Nutritional' | 'Microbiological' | 'Shelf Life' | 'Heavy Metals / Pesticides' | 'Aflatoxin Analysis';
  batchCode?: string;
  labName: string;
  testDate: Date;
  expiryDate: Date;
  retestFrequencyMonths: number;
  reportUrl: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  parameterResults: {
    parameter: string;
    value: string;
    standardLimit: string;
    passed: boolean;
  }[];
  verifiedBy: string;
  notes?: string;
}

const ComplianceTestSchema = new Schema<IComplianceTest>({
  skuId: { type: String, required: true },
  skuName: { type: String, required: true },
  testType: {
    type: String,
    enum: ['FSSAI Nutritional', 'Microbiological', 'Shelf Life', 'Heavy Metals / Pesticides', 'Aflatoxin Analysis'],
    required: true
  },
  batchCode: { type: String },
  labName: { type: String, default: 'Eurofins / SGS Labs' },
  testDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  retestFrequencyMonths: { type: Number, default: 6 },
  reportUrl: { type: String, default: 'https://drive.google.com/koh-reports/sample-fssai.pdf' },
  status: { type: String, enum: ['valid', 'expiring_soon', 'expired'], default: 'valid' },
  parameterResults: [{
    parameter: String,
    value: String,
    standardLimit: String,
    passed: { type: Boolean, default: true }
  }],
  verifiedBy: { type: String, default: 'QA Lead - Dr. Sharma' },
  notes: { type: String }
});

export const ComplianceTest = mongoose.models.ComplianceTest || mongoose.model<IComplianceTest>('ComplianceTest', ComplianceTestSchema);
