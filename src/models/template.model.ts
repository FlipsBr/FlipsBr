import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  language: string;
  category: string;
  components: Array<{
    type: string;
    format?: string;
    text?: string;
    buttons?: Array<{
      type: string;
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  metaTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    components: [
      {
        type: {
          type: String,
          required: true,
        },
        format: String,
        text: String,
        buttons: [
          {
            type: String,
            text: String,
            url: String,
            phone_number: String,
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'PENDING',
    },
    metaTemplateId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

TemplateSchema.index({ name: 1, language: 1 }, { unique: true });

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
