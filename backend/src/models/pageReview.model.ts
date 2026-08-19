import mongoose, { Schema, Document } from 'mongoose';

export type PageReviewStatus = 'submitted' | 'changes_requested' | 'approved' | 'superseded';

export interface IPageReview extends Document {
  pageId: mongoose.Types.ObjectId;
  pageVersionId: mongoose.Types.ObjectId;
  versionNumber: number;
  roundNumber: number;
  status: PageReviewStatus;
  submittedBy: mongoose.Types.ObjectId;
  submittedAt: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  feedback?: string;
  supersededAt?: Date;
  supersededByReviewId?: mongoose.Types.ObjectId;
  publishedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
}

const pageReviewSchema: Schema = new Schema(
  {
    pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
    pageVersionId: { type: Schema.Types.ObjectId, ref: 'PageVersion', required: true },
    versionNumber: { type: Number, required: true },
    roundNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['submitted', 'changes_requested', 'approved', 'superseded'],
      required: true
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    feedback: { type: String },
    supersededAt: { type: Date },
    supersededByReviewId: { type: Schema.Types.ObjectId, ref: 'PageReview' },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date }
  },
  { timestamps: false }
);

pageReviewSchema.index(
  { pageId: 1, roundNumber: 1 },
  { unique: true }
);

pageReviewSchema.index(
  { pageId: 1 },
  { unique: true, partialFilterExpression: { status: 'submitted' } }
);

pageReviewSchema.index({ pageId: 1, status: 1 });

export default mongoose.model<IPageReview>('PageReview', pageReviewSchema);
