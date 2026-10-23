import mongoose, { Schema, Document } from 'mongoose';

export interface IInfluencer extends Document {
  name: string;
  handle: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok';
  followers: number;
  niche: 'Health & Wellness' | 'Parenting & Kids Food' | 'Clean Eating / Vegan' | 'Fitness & Bodybuilding' | 'Culinary Chefs';
  status: 'outreach' | 'contracted' | 'product_sent' | 'content_review' | 'live' | 'completed';
  collaborations: {
    campaignName: string;
    productSent: string;
    productCost: number;
    fee: number;
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    postUrl?: string;
    impressions?: number;
    ordersTracked?: number;
    revenueGenerated?: number;
    roas?: number;
    date: Date;
  }[];
  totalSpent: number;
  totalRevenue: number;
  overallRoas: number;
  contactEmail: string;
  contactPhone: string;
  notes?: string;
  createdAt: Date;
}

const InfluencerSchema = new Schema<IInfluencer>({
  name: { type: String, required: true },
  handle: { type: String, required: true },
  platform: { type: String, enum: ['Instagram', 'YouTube', 'TikTok'], default: 'Instagram' },
  followers: { type: Number, default: 10000 },
  niche: {
    type: String,
    enum: ['Health & Wellness', 'Parenting & Kids Food', 'Clean Eating / Vegan', 'Fitness & Bodybuilding', 'Culinary Chefs'],
    default: 'Health & Wellness'
  },
  status: {
    type: String,
    enum: ['outreach', 'contracted', 'product_sent', 'content_review', 'live', 'completed'],
    default: 'outreach'
  },
  collaborations: [{
    campaignName: String,
    productSent: String,
    productCost: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    postUrl: String,
    impressions: { type: Number, default: 0 },
    ordersTracked: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 },
    roas: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  }],
  totalSpent: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  overallRoas: { type: Number, default: 0 },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Influencer = mongoose.models.Influencer || mongoose.model<IInfluencer>('Influencer', InfluencerSchema);
