import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: string; // 'Admin' | 'Editor' | 'Performance' | 'Community' | 'Ops' | 'Batch Staff' | 'Custom'
  modules: string[]; // array of tab/module IDs: ['dashboard', 'board', 'calendar', 'shoots', 'ads', 'statics', 'influencers', 'analytics', 'skus', 'farmers', 'factory', 'production', 'planning', 'npd', 'inventory', 'pnl', 'users', 'flowchart', etc.]
  avatar?: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, default: 'password123' },
  role: { type: String, default: 'Batch Staff' },
  modules: [{ type: String }],
  avatar: { type: String, default: '👤' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export interface IActivityLog extends Document {
  module: string;
  action: 'create' | 'update' | 'delete' | 'stage_change' | 'payment' | 'dispatch' | 'approval' | 'login';
  title: string;
  description: string;
  entityId?: string;
  userName: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  module: { type: String, required: true },
  action: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  entityId: { type: String },
  userName: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now }
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
