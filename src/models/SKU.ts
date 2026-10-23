import mongoose, { Schema, Document } from 'mongoose';

export interface ISKU extends Document {
  skuCode: string;
  name: string;
  category: 'Single Ingredient Powders' | 'Crunchy Fruit Bites' | 'Veggie Crisps' | 'Superfood Blends';
  produceSource: string;
  packWeightGm: number;
  mrp: number;
  sellingPrice: number;
  rawMaterialCost: number;
  labourCost: number;
  packagingCost: number;
  cogs: number; // rawMaterialCost + labourCost + packagingCost
  grossMarginPercent: number; // ((sellingPrice - cogs) / sellingPrice) * 100
  currentStock: number; // in units/packs
  reorderThreshold: number;
  platforms: {
    amazon: boolean;
    blinkit: boolean;
    d2c: boolean;
    b2b: boolean;
    instamart?: boolean;
    zepto?: boolean;
  };
  fssaiLicenseNumber: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'discontinued';
  createdAt: Date;
}

const SKUSchema = new Schema<ISKU>({
  skuCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Single Ingredient Powders' },
  produceSource: { type: String, required: true },
  packWeightGm: { type: Number, required: true },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  rawMaterialCost: { type: Number, default: 0 },
  labourCost: { type: Number, default: 0 },
  packagingCost: { type: Number, default: 0 },
  cogs: { type: Number, default: 0 },
  grossMarginPercent: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  reorderThreshold: { type: Number, default: 50 },
  platforms: {
    amazon: { type: Boolean, default: true },
    blinkit: { type: Boolean, default: true },
    d2c: { type: Boolean, default: true },
    b2b: { type: Boolean, default: false },
    instamart: { type: Boolean, default: false },
    zepto: { type: Boolean, default: false }
  },
  fssaiLicenseNumber: { type: String, default: '13621014000321' },
  status: { type: String, enum: ['active', 'low_stock', 'out_of_stock', 'discontinued'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const SKU = mongoose.models.SKU || mongoose.model<ISKU>('SKU', SKUSchema);
