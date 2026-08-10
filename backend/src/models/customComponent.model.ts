import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomComponentTemplate {
  rootComponentId: string;
  components: Record<string, any>[]; // Keep it compatible with BuilderComponent structure
}

export interface ICustomComponent extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  nameKey: string;
  description: string;
  template: ICustomComponentTemplate;
  createdAt: Date;
  updatedAt: Date;
}

const customComponentSchema: Schema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    nameKey: { type: String, required: true },
    description: { type: String, default: "", trim: true, maxlength: 240 },
    template: {
      rootComponentId: { type: String, required: true },
      components: { type: [Schema.Types.Mixed], required: true }
    }
  },
  { timestamps: true }
);

customComponentSchema.index({ ownerId: 1, nameKey: 1 }, { unique: true });

export default mongoose.model<ICustomComponent>('CustomComponent', customComponentSchema);
