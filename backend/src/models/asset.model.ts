import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  ownerId: mongoose.Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema: Schema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IAsset>('Asset', assetSchema);
