import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailCredential extends Document {
  tenantId: string;
  userId: string;
  provider: 'gmail' | 'outlook' | 'google';
  email: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emailCredentialSchema = new Schema<IEmailCredential>({
  tenantId: { type: String, required: true },
  userId: { type: String, required: true },
  provider: { type: String, enum: ['gmail', 'outlook', 'google'], required: true },
  email: { type: String, required: true, unique: true },
  accessToken: { type: String, required: false },
  refreshToken: { type: String, required: false }
}, {
  timestamps: true
});

// Compound index to ensure unique (tenantId, userId) pairs
emailCredentialSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

export const EmailCredential = mongoose.model<IEmailCredential>('EmailCredential', emailCredentialSchema); 