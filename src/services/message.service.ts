import { Message, IMessage } from '../models';
import { MessageType, MessageStatus, MessageContent } from '../types';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';

export interface CreateMessageInput {
  conversationId: Types.ObjectId;
  messageId: string;
  from: string;
  to: string;
  type: MessageType;
  content: MessageContent;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  contextMessageId?: string;
  status?: MessageStatus;
}

export interface UpdateMessageInput {
  status?: MessageStatus;
  deliveredAt?: Date;
  readAt?: Date;
  failedReason?: string;
}

export class MessageService {
  async create(input: CreateMessageInput): Promise<IMessage> {
    const message = await Message.create({
      ...input,
      status: input.status || (input.direction === 'outbound' ? 'pending' : 'delivered'),
    });
    
    logger.info(`Message created: ${message.messageId}`);
    return message;
  }

  async findById(id: string): Promise<IMessage> {
    const message = await Message.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }
    return message;
  }

  async findByMessageId(messageId: string): Promise<IMessage | null> {
    return Message.findOne({ messageId });
  }

  async update(messageId: string, input: UpdateMessageInput): Promise<IMessage> {
    const message = await Message.findOneAndUpdate(
      { messageId },
      { $set: input },
      { new: true }
    );

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    return message;
  }

  async updateStatus(
    messageId: string,
    status: MessageStatus,
    timestamp?: Date
  ): Promise<IMessage | null> {
    const updateData: UpdateMessageInput = { status };

    if (status === 'delivered' && timestamp) {
      updateData.deliveredAt = timestamp;
    } else if (status === 'read' && timestamp) {
      updateData.readAt = timestamp;
    }

    const message = await Message.findOneAndUpdate(
      { messageId },
      { $set: updateData },
      { new: true }
    );

    if (message) {
      logger.debug(`Message ${messageId} status updated to ${status}`);
    }

    return message;
  }

  async markAsFailed(messageId: string, reason: string): Promise<IMessage | null> {
    return Message.findOneAndUpdate(
      { messageId },
      { $set: { status: 'failed', failedReason: reason } },
      { new: true }
    );
  }

  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IMessage[]; total: number }> {
    const [messages, total] = await Promise.all([
      Message.find({ conversationId: new Types.ObjectId(conversationId) })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Message.countDocuments({ conversationId: new Types.ObjectId(conversationId) }),
    ]);

    return { messages: messages.reverse(), total };
  }

  async getMessagesByPhone(
    phoneNumber: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IMessage[]; total: number }> {
    const query = { $or: [{ from: phoneNumber }, { to: phoneNumber }] };

    const [messages, total] = await Promise.all([
      Message.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Message.countDocuments(query),
    ]);

    return { messages: messages.reverse(), total };
  }

  async searchMessages(
    query: string,
    conversationId?: string,
    limit: number = 20
  ): Promise<IMessage[]> {
    const filter: Record<string, unknown> = {
      'content.text.body': { $regex: query, $options: 'i' },
    };

    if (conversationId) {
      filter.conversationId = new Types.ObjectId(conversationId);
    }

    return Message.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async getMessageStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    inbound: number;
    outbound: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const dateFilter = { timestamp: { $gte: startDate, $lte: endDate } };

    const [total, inbound, outbound, byType, byStatus] = await Promise.all([
      Message.countDocuments(dateFilter),
      Message.countDocuments({ ...dateFilter, direction: 'inbound' }),
      Message.countDocuments({ ...dateFilter, direction: 'outbound' }),
      Message.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Message.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      inbound,
      outbound,
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    };
  }

  async deleteMessage(messageId: string): Promise<void> {
    await Message.deleteOne({ messageId });
    logger.info(`Message deleted: ${messageId}`);
  }
}

export const messageService = new MessageService();
