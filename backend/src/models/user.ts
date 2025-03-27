import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  provider: string;
  tenantId?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  provider: { type: String, required: true },
  tenantId: { type: String, default: "somish" },
  userId: { type: String, default: "vivek.behera@somish.com" },
  accessToken: { type: String },
  refreshToken: { type: String }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 