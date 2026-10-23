import mongoose, { Schema, Document } from 'mongoose';

export interface IShootClip extends Document {
  clipId: string;
  title: string;
  location: 'Farm Field' | 'Factory Dehydration' | 'Factory Milling/Powder' | 'Packaging Line' | 'Kitchen Studio' | 'Founder Vlog';
  cropOrProduce: string;
  durationSeconds: number;
  tags: string[]; // e.g. ['#farmer-harvest', '#carrot-slicing', '#dryer-steam', '#taste-test']
  videoUrl: string;
  thumbnailUrl: string;
  resolution: string;
  shootDate: Date;
  cameraOperator: string;
  usageCount: number;
  status: 'raw' | 'edited' | 'archived';
  relatedBatchCode?: string;
  relatedCropCycleId?: string;
}

const ShootClipSchema = new Schema<IShootClip>({
  clipId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  location: {
    type: String,
    enum: ['Farm Field', 'Factory Dehydration', 'Factory Milling/Powder', 'Packaging Line', 'Kitchen Studio', 'Founder Vlog'],
    default: 'Factory Dehydration'
  },
  cropOrProduce: { type: String, default: 'General' },
  durationSeconds: { type: Number, default: 15 },
  tags: [{ type: String }],
  videoUrl: { type: String, default: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-through-a-crop-field-41558-large.mp4' },
  thumbnailUrl: { type: String, default: '' },
  resolution: { type: String, default: '4K 60fps' },
  shootDate: { type: Date, default: Date.now },
  cameraOperator: { type: String, default: 'Creative Team' },
  usageCount: { type: Number, default: 0 },
  status: { type: String, enum: ['raw', 'edited', 'archived'], default: 'raw' },
  relatedBatchCode: { type: String },
  relatedCropCycleId: { type: String }
});

export const ShootClip = mongoose.models.ShootClip || mongoose.model<IShootClip>('ShootClip', ShootClipSchema);
