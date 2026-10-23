import mongoose, { Schema, Document } from 'mongoose';

export interface IContentItem extends Document {
  title: string;
  pillar: 'Made With Care' | '5-Min Nutrition' | 'koh! Family' | 'Behind The Factory' | 'Farmer Spotlight';
  stage: 'Idea' | 'Script' | 'Shoot' | 'Edit' | 'Review' | 'Ready' | 'Published';
  format: 'Reel/Short' | 'Longform Video' | 'Carousel Post' | 'Story' | 'Statics/Banner';
  targetSkuId?: string;
  targetSkuName?: string;
  clipIds: string[];
  hookText: string;
  scriptText?: string;
  assignedTo: string;
  channel: 'Instagram' | 'YouTube' | 'Meta Ads' | 'LinkedIn' | 'Amazon A+';
  scheduledDate?: Date;
  publishedDate?: Date;
  postUrl?: string;
  boostCandidate: boolean;
  performance?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    roas?: number;
  };
  createdAt: Date;
}

const ContentItemSchema = new Schema<IContentItem>({
  title: { type: String, required: true },
  pillar: {
    type: String,
    enum: ['Made With Care', '5-Min Nutrition', 'koh! Family', 'Behind The Factory', 'Farmer Spotlight'],
    default: 'Made With Care'
  },
  stage: {
    type: String,
    enum: ['Idea', 'Script', 'Shoot', 'Edit', 'Review', 'Ready', 'Published'],
    default: 'Idea'
  },
  format: {
    type: String,
    enum: ['Reel/Short', 'Longform Video', 'Carousel Post', 'Story', 'Statics/Banner'],
    default: 'Reel/Short'
  },
  targetSkuId: { type: String },
  targetSkuName: { type: String },
  clipIds: [{ type: String }],
  hookText: { type: String, default: '' },
  scriptText: { type: String, default: '' },
  assignedTo: { type: String, default: 'Creative Team' },
  channel: { type: String, enum: ['Instagram', 'YouTube', 'Meta Ads', 'LinkedIn', 'Amazon A+'], default: 'Instagram' },
  scheduledDate: { type: Date },
  publishedDate: { type: Date },
  postUrl: { type: String },
  boostCandidate: { type: Boolean, default: false },
  performance: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    roas: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

export const ContentItem = mongoose.models.ContentItem || mongoose.model<IContentItem>('ContentItem', ContentItemSchema);
