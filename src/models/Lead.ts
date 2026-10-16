import mongoose, { Document, Schema } from 'mongoose';

export type FollowUpStatus = 'pending' | 'in-progress' | 'completed' | 'not-needed';

export interface ILead extends Document {
  name: string;
  company: string;
  email: string;
  phone?: string;
  event: string;
  notes: string;
  followUpStatus: FollowUpStatus;
  aiSummary?: string;
  aiDraftMessage?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    event: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    followUpStatus: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'not-needed'],
      default: 'pending',
    },
    aiSummary: {
      type: String,
      default: '',
    },
    aiDraftMessage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
LeadSchema.index({ name: 'text', company: 'text', event: 'text', email: 'text' });

const Lead = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
