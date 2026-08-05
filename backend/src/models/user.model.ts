import mongoose, { Schema, Document } from 'mongoose';

export type AccountStatus = 'active' | 'suspended';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user-developer';
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user-developer'], required: true, default: 'user-developer' },
  accountStatus: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
