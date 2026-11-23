import mongoose, { Schema, Document } from 'mongoose';

export interface IInfluencer extends Document {
  name: string;
  handle: string;
  profileUrl?: string;
  profilePicUrl?: string;
  platform: 'Instagram' | 'YouTube' | 'Facebook' | string;
  followers: number;
  engagementRate?: number;
  totalReels?: number;
  tier?: 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
  niche: string;
  gender?: 'Female' | 'Male' | 'Non-binary' | 'Other';
  age?: string | number;
  geographicalData?: {
    country?: string;
    state?: string;
    city?: string;
    audienceGeo?: string;
  };
  status: 'active' | 'outreach' | 'contracted' | 'paused';
  collaborations: {
    _id?: string;
    campaignName?: string;
    deliverable?: string;
    dealType?: 'barter' | 'paid' | 'rev_share' | 'hybrid';
    barterDetails?: {
      productSent?: string;
      productCost?: number;
      dispatchStatus?: string;
      trackingNumber?: string;
    };
    productSent?: string;
    productCost?: number;
    fee: number;
    revenueSharePercent?: number;
    paymentStatus: 'unpaid' | 'advance_paid' | 'fully_paid' | 'barter_delivered' | 'partial';
    utrNumber?: string;
    paymentMethod?: string;
    paymentDate?: string;
    paymentDueDate?: string;
    postUrl?: string;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    reach?: number;
    engagementRate?: number;
    ordersTracked?: number;
    revenue?: number;
    roi?: number;
    promoCode?: string;
    shopifyLastSyncedAt?: Date | string;
    date?: Date;
  }[];
  totalSpent: number;
  totalRevenue: number;
  overallRoas: number;
  contactEmail: string;
  contactPhone: string;
  city?: string;
  notes?: string;
  createdAt: Date;
}

const InfluencerSchema = new Schema<IInfluencer>({
  name: { type: String, required: true },
  handle: { type: String, required: true },
  profileUrl: { type: String },
  profilePicUrl: { type: String },
  platform: { type: String, default: 'Instagram' },
  followers: { type: Number, default: 10000 },
  engagementRate: { type: Number, default: 5.0 },
  totalReels: { type: Number, default: 50 },
  tier: { type: String, default: 'micro' },
  niche: { type: String, default: 'Clinical Nutrition & Gut Health' },
  gender: { type: String, default: 'Female' },
  age: { type: Schema.Types.Mixed, default: '25-34' },
  geographicalData: {
    country: { type: String, default: 'India' },
    state: { type: String, default: 'Maharashtra' },
    city: { type: String, default: 'Mumbai' },
    audienceGeo: { type: String, default: '80% India, 12% UAE, 8% US' }
  },
  status: { type: String, default: 'active' },
  collaborations: [{
    campaignName: String,
    deliverable: String,
    dealType: { type: String, default: 'paid' },
    barterDetails: {
      productSent: String,
      productCost: { type: Number, default: 0 },
      dispatchStatus: { type: String, default: 'delivered' },
      trackingNumber: String
    },
    productSent: String,
    productCost: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    revenueSharePercent: { type: Number, default: 0 },
    paymentStatus: { type: String, default: 'unpaid' },
    utrNumber: String,
    paymentMethod: { type: String, default: 'UPI' },
    paymentDate: String,
    paymentDueDate: String,
    postUrl: String,
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    ordersTracked: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
    promoCode: { type: String },
    shopifyLastSyncedAt: { type: Date },
    date: { type: Date, default: Date.now }
  }],
  totalSpent: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  overallRoas: { type: Number, default: 0 },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  city: { type: String, default: '' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Influencer = mongoose.models.Influencer || mongoose.model<IInfluencer>('Influencer', InfluencerSchema);

