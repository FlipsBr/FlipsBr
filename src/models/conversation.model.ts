import mongoose, { Document, Schema, Types } from 'mongoose';
import { ConversationStatus } from '../types';

export interface IConversation extends Document {
  userId: Types.ObjectId;
  waConversationId?: string;
  phoneNumber: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageId?: Types.ObjectId;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  assignedTo?: string;
  tags: string[];
  expiresAt?: Date;
  origin?: string;
  metadata?: Map<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    waConversationId: {
      type: String,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      index: true,
    },
    lastMessagePreview: {
      type: String,
    },
    assignedTo: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
    },
    origin: {
      type: String,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ userId: 1, status: 1 });
ConversationSchema.index({ status: 1, lastMessageAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
