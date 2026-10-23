import mongoose, { Schema, Document } from 'mongoose';

export interface INPDProduct extends Document {
  title: string;
  concept: string;
  category: string;
  surplusCrop: string;
  originatingSignal: string; // e.g., 'Agri Officer flagged 4 Tons surplus bitter gourd from Sangareddy cluster'
  stage: 'Surplus Signal' | 'Demand Validation' | 'Lab Trial & Formulation' | 'Commercial Trial' | 'Compliance & Launch';
  demandValidation: {
    marketSizeEstimate: string;
    competitorBrands: string[];
    recommendedPriceRange: string;
    consumerTarget: string;
    isApproved: boolean;
  };
  labTrial: {
    formulationNotes: string;
    dehydrationTempC: number;
    tasteScore: number; // 1 to 10
    textureScore: number;
    yieldObservedPercent: number;
    recipeLocked: boolean;
  };
  commercialTrial: {
    batchTrialCode?: string;
    trialYieldKg: number;
    pilotPacksProduced: number;
    fssaiReportUrl?: string;
    compliancePassed: boolean;
  };
  targetMrp: number;
  estimatedCogs: number;
  estimatedGrossMarginPercent: number;
  createdSkuCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NPDProductSchema = new Schema<INPDProduct>({
  title: { type: String, required: true },
  concept: { type: String, required: true },
  category: { type: String, default: 'Superfood Blends' },
  surplusCrop: { type: String, required: true },
  originatingSignal: { type: String, default: '' },
  stage: {
    type: String,
    enum: ['Surplus Signal', 'Demand Validation', 'Lab Trial & Formulation', 'Commercial Trial', 'Compliance & Launch'],
    default: 'Surplus Signal'
  },
  demandValidation: {
    marketSizeEstimate: { type: String, default: '₹12 Cr / year' },
    competitorBrands: [{ type: String }],
    recommendedPriceRange: { type: String, default: '₹249 - ₹299' },
    consumerTarget: { type: String, default: 'Health conscious urban parents' },
    isApproved: { type: Boolean, default: false }
  },
  labTrial: {
    formulationNotes: { type: String, default: '' },
    dehydrationTempC: { type: Number, default: 55 },
    tasteScore: { type: Number, default: 8.5 },
    textureScore: { type: Number, default: 8.0 },
    yieldObservedPercent: { type: Number, default: 8.0 },
    recipeLocked: { type: Boolean, default: false }
  },
  commercialTrial: {
    batchTrialCode: { type: String },
    trialYieldKg: { type: Number, default: 0 },
    pilotPacksProduced: { type: Number, default: 0 },
    fssaiReportUrl: { type: String },
    compliancePassed: { type: Boolean, default: false }
  },
  targetMrp: { type: Number, default: 249 },
  estimatedCogs: { type: Number, default: 85 },
  estimatedGrossMarginPercent: { type: Number, default: 65.8 },
  createdSkuCode: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const NPDProduct = mongoose.models.NPDProduct || mongoose.model<INPDProduct>('NPDProduct', NPDProductSchema);
