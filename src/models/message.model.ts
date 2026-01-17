import mongoose, { Document, Schema, Types } from 'mongoose';
import { MessageType, MessageStatus, MessageContent } from '../types';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  messageId: string;
  from: string;
  to: string;
  type: MessageType;
  content: MessageContent;
  status: MessageStatus;
  direction: 'inbound' | 'outbound';
  contextMessageId?: string;
  timestamp: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedReason?: string;
  metadata?: Map<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageContentSchema = new Schema(
  {
    text: {
      body: String,
      preview_url: Boolean,
    },
    image: {
      id: String,
      link: String,
      caption: String,
      filename: String,
    },
    video: {
      id: String,
      link: String,
      caption: String,
      filename: String,
    },
    audio: {
      id: String,
      link: String,
      caption: String,
      filename: String,
    },
    document: {
      id: String,
      link: String,
      caption: String,
      filename: String,
    },
    sticker: {
      id: String,
      link: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
      name: String,
      address: String,
    },
    contacts: [Schema.Types.Mixed],
    interactive: Schema.Types.Mixed,
    template: Schema.Types.Mixed,
    reaction: {
      message_id: String,
      emoji: String,
    },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
      index: true,
    },
    to: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'text',
        'image',
        'video',
        'audio',
        'document',
        'sticker',
        'location',
        'contacts',
        'interactive',
        'template',
        'reaction',
      ],
      required: true,
    },
    content: {
      type: MessageContentSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },
    contextMessageId: {
      type: String,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    failedReason: {
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

MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ from: 1, timestamp: -1 });
MessageSchema.index({ to: 1, timestamp: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
