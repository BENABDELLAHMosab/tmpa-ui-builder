import mongoose, { Schema, Document } from 'mongoose';

export const PAGE_VERSION_REASONS = [
  "initial",
  "legacy-baseline",
  "manual-save",
  "restore",
  "publication"
] as const;

export type PageVersionReason = (typeof PAGE_VERSION_REASONS)[number];

export interface IPageVersion extends Document {
  pageId: mongoose.Types.ObjectId;
  versionNumber: number;
  schemaSnapshot: Record<string, unknown>;
  contentHash: string;
  createdBy: mongoose.Types.ObjectId;
  reason: PageVersionReason;
  createdAt: Date;
}

const pageVersionSchema: Schema = new Schema(
  {
    pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
    versionNumber: { type: Number, required: true, min: 1 },
    schemaSnapshot: { type: Schema.Types.Mixed, required: true },
    contentHash: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, enum: PAGE_VERSION_REASONS, required: true }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

pageVersionSchema.index(
  { pageId: 1, versionNumber: 1 },
  { unique: true }
);

pageVersionSchema.index({
  pageId: 1,
  createdAt: -1
});

export default mongoose.model<IPageVersion>('PageVersion', pageVersionSchema);
