import { Conversation, IConversation, User } from '../models';
import { ConversationStatus } from '../types';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';

export interface CreateConversationInput {
  userId: Types.ObjectId;
  phoneNumber: string;
  waConversationId?: string;
  origin?: string;
  expiresAt?: Date;
}

export interface UpdateConversationInput {
  status?: ConversationStatus;
  assignedTo?: string;
  tags?: string[];
  waConversationId?: string;
  expiresAt?: Date;
}

export class ConversationService {
  async findOrCreate(input: CreateConversationInput): Promise<IConversation> {
    let conversation = await Conversation.findOne({
      userId: input.userId,
      status: { $ne: 'closed' },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        ...input,
        status: 'active',
      });
      logger.info(`Created new conversation for user: ${input.userId}`);
    }

    return conversation;
  }

  async findById(id: string): Promise<IConversation> {
    const conversation = await Conversation.findById(id).populate('userId');
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }
    return conversation;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<IConversation | null> {
    return Conversation.findOne({
      phoneNumber,
      status: { $ne: 'closed' },
    }).populate('userId');
  }

  async findByUserId(userId: string): Promise<IConversation[]> {
    return Conversation.find({ userId }).sort({ lastMessageAt: -1 });
  }

  async update(id: string, input: UpdateConversationInput): Promise<IConversation> {
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true }
    );

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    return conversation;
  }

  async updateLastMessage(
    conversationId: Types.ObjectId,
    messageId: Types.ObjectId,
    preview: string,
    incrementUnread: boolean = false
  ): Promise<void> {
    const update: Record<string, unknown> = {
      $set: {
        lastMessageId: messageId,
        lastMessageAt: new Date(),
        lastMessagePreview: preview.substring(0, 100),
      },
    };

    if (incrementUnread) {
      update.$inc = { unreadCount: 1 };
    }

    await Conversation.updateOne({ _id: conversationId }, update);
  }

  async markAsRead(id: string): Promise<void> {
    await Conversation.updateOne(
      { _id: id },
      { $set: { unreadCount: 0 } }
    );
  }

  async archive(id: string): Promise<IConversation> {
    return this.update(id, { status: 'archived' });
  }

  async close(id: string): Promise<IConversation> {
    return this.update(id, { status: 'closed' });
  }

  async reopen(id: string): Promise<IConversation> {
    return this.update(id, { status: 'active' });
  }

  async assignTo(id: string, assignee: string): Promise<IConversation> {
    return this.update(id, { assignedTo: assignee });
  }

  async addTags(id: string, tags: string[]): Promise<IConversation> {
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    );

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    return conversation;
  }

  async removeTags(id: string, tags: string[]): Promise<IConversation> {
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { $pullAll: { tags } },
      { new: true }
    );

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    return conversation;
  }

  async list(
    page: number = 1,
    limit: number = 20,
    filter?: {
      status?: ConversationStatus;
      assignedTo?: string;
      tags?: string[];
    }
  ): Promise<{ conversations: IConversation[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }

    if (filter?.assignedTo) {
      query.assignedTo = filter.assignedTo;
    }

    if (filter?.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate('userId')
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Conversation.countDocuments(query),
    ]);

    return { conversations, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await Conversation.aggregate([
      { $match: { userId: new Types.ObjectId(userId), status: 'active' } },
      { $group: { _id: null, total: { $sum: '$unreadCount' } } },
    ]);

    return result[0]?.total || 0;
  }
}

export const conversationService = new ConversationService();
