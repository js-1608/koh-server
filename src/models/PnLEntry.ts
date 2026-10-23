import mongoose, { Schema, Document } from 'mongoose';

export interface IPnLEntry extends Document {
  month: string; // e.g. '2026-09'
  revenue: {
    d2c: number;
    amazon: number;
    blinkit: number;
    b2b: number;
    exports: number;
    totalRevenue: number;
  };
  cogs: {
    rawMaterialProcurement: number; // auto-rolled from Farm receipts
    processingLabour: number;       // auto-rolled from Dehydration labour
    packagingCost: number;          // auto-rolled from Packing outputs
    factoryUtilities: number;       // power, gas, water
    totalCogs: number;
  };
  grossProfit: number; // totalRevenue - totalCogs
  grossMarginPercent: number; // (grossProfit / totalRevenue) * 100
  operatingExpenses: {
    marketingAdsMeta: number;
    marketingAdsGoogle: number;
    marketingAdsAmazon: number;
    influencerCollabs: number;
    contentProduction: number;
    teamSalaries: number;
    factoryRent: number;
    logisticsAndShipping: number;
    paymentGatewayFees: number;
    fbaAndQuickCommerceFees: number;
    rtoAndDamageCost: number;
    softwareAndCloud: number;
    legalAndInsurance: number;
    travelAndAdmin: number;
    depreciation: number;
    interestAndFinance: number;
    totalOpex: number;
  };
  ebitda: number; // grossProfit - totalOpex + depreciation
  ebitdaMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  notes?: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PnLEntrySchema = new Schema<IPnLEntry>({
  month: { type: String, required: true, unique: true },
  revenue: {
    d2c: { type: Number, default: 0 },
    amazon: { type: Number, default: 0 },
    blinkit: { type: Number, default: 0 },
    b2b: { type: Number, default: 0 },
    exports: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  cogs: {
    rawMaterialProcurement: { type: Number, default: 0 },
    processingLabour: { type: Number, default: 0 },
    packagingCost: { type: Number, default: 0 },
    factoryUtilities: { type: Number, default: 0 },
    totalCogs: { type: Number, default: 0 }
  },
  grossProfit: { type: Number, default: 0 },
  grossMarginPercent: { type: Number, default: 0 },
  operatingExpenses: {
    marketingAdsMeta: { type: Number, default: 0 },
    marketingAdsGoogle: { type: Number, default: 0 },
    marketingAdsAmazon: { type: Number, default: 0 },
    influencerCollabs: { type: Number, default: 0 },
    contentProduction: { type: Number, default: 0 },
    teamSalaries: { type: Number, default: 0 },
    factoryRent: { type: Number, default: 0 },
    logisticsAndShipping: { type: Number, default: 0 },
    paymentGatewayFees: { type: Number, default: 0 },
    fbaAndQuickCommerceFees: { type: Number, default: 0 },
    rtoAndDamageCost: { type: Number, default: 0 },
    softwareAndCloud: { type: Number, default: 0 },
    legalAndInsurance: { type: Number, default: 0 },
    travelAndAdmin: { type: Number, default: 0 },
    depreciation: { type: Number, default: 0 },
    interestAndFinance: { type: Number, default: 0 },
    totalOpex: { type: Number, default: 0 }
  },
  ebitda: { type: Number, default: 0 },
  ebitdaMarginPercent: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  netMarginPercent: { type: Number, default: 0 },
  notes: { type: String },
  isLocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const PnLEntry = mongoose.models.PnLEntry || mongoose.model<IPnLEntry>('PnLEntry', PnLEntrySchema);
