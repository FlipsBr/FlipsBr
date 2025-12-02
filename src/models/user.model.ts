import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  waId: string;
  phoneNumber: string;
  name: string;
  profilePicture?: string;
  isBlocked: boolean;
  tags: string[];
  customFields: Map<string, string>;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    waId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    customFields: {
      type: Map,
      of: String,
      default: new Map(),
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ name: 'text' });

export const User = mongoose.model<IUser>('User', UserSchema);
