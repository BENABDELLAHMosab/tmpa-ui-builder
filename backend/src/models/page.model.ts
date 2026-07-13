import mongoose, { Schema, Document } from 'mongoose';

export interface IPage extends Omit<Document, 'schema'> {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  schema: Record<string, any>;
  version: number;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
}

const pageSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected', 'published'],
      default: 'draft'
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
    schema: { type: Schema.Types.Mixed, default: { components: [] } },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model<IPage>('Page', pageSchema);
