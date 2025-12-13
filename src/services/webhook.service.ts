import { WebhookLog, IWebhookLog } from '../models';
import {
  WebhookPayload,
  WebhookMessage,
  WebhookStatus,
  WebhookContact,
} from '../types';
import { logger } from '../utils/logger';
import { userService } from './user.service';
import { conversationService } from './conversation.service';
import { messageService } from './message.service';
import { config } from '../config';

export class WebhookService {
  async logWebhook(eventType: string, payload: Record<string, unknown>): Promise<IWebhookLog> {
    return WebhookLog.create({
      eventType,
      payload,
      status: 'pending',
    });
  }

  async processWebhook(payload: WebhookPayload): Promise<void> {
    const log = await this.logWebhook('whatsapp_webhook', payload as unknown as Record<string, unknown>);

    try {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value;

            // Process incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                const contact = value.contacts?.find(
                  (c) => c.wa_id === message.from
                );
                await this.processIncomingMessage(message, contact);
              }
            }

            // Process status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                await this.processStatusUpdate(status);
              }
            }
          }
        }
      }

      await WebhookLog.updateOne(
        { _id: log._id },
        { $set: { status: 'processed', processedAt: new Date() } }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await WebhookLog.updateOne(
        { _id: log._id },
        { $set: { status: 'failed', error: errorMessage } }
      );
      throw error;
    }
  }

  private async processIncomingMessage(
    message: WebhookMessage,
    contact?: WebhookContact
  ): Promise<void> {
    logger.info(`Processing incoming message: ${message.id} from ${message.from}`);

    // Find or create user
    const user = await userService.findOrCreate({
      waId: message.from,
      phoneNumber: message.from,
      name: contact?.profile.name || message.from,
    });

    // Find or create conversation
    const conversation = await conversationService.findOrCreate({
      userId: user._id,
      phoneNumber: message.from,
    });

    // Extract message content based on type
    const content = this.extractMessageContent(message);

    // Create message record
    const savedMessage = await messageService.create({
      conversationId: conversation._id,
      messageId: message.id,
      from: message.from,
      to: config.meta.phoneNumberId,
      type: message.type,
      content,
      direction: 'inbound',
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      contextMessageId: message.context?.id,
      status: 'delivered',
    });

    // Update conversation
    const preview = this.getMessagePreview(message);
    await conversationService.updateLastMessage(
      conversation._id,
      savedMessage._id,
      preview,
      true // increment unread count
    );

    // Update user's last message time
    await userService.updateLastMessage(user.waId);

    logger.info(`Message ${message.id} processed successfully`);
  }

  private async processStatusUpdate(status: WebhookStatus): Promise<void> {
    logger.debug(`Processing status update: ${status.id} -> ${status.status}`);

    const timestamp = new Date(parseInt(status.timestamp) * 1000);
    
    await messageService.updateStatus(status.id, status.status, timestamp);

    // Update conversation info if available
    if (status.conversation) {
      const message = await messageService.findByMessageId(status.id);
      if (message) {
        await conversationService.update(message.conversationId.toString(), {
          waConversationId: status.conversation.id,
          expiresAt: status.conversation.expiration_timestamp
            ? new Date(parseInt(status.conversation.expiration_timestamp) * 1000)
            : undefined,
        });
      }
    }
  }

  private extractMessageContent(message: WebhookMessage): Record<string, unknown> {
    const content: Record<string, unknown> = {};

    switch (message.type) {
      case 'text':
        content.text = message.text;
        break;
      case 'image':
        content.image = message.image;
        break;
      case 'video':
        content.video = message.video;
        break;
      case 'audio':
        content.audio = message.audio;
        break;
      case 'document':
        content.document = message.document;
        break;
      case 'sticker':
        content.sticker = message.sticker;
        break;
      case 'location':
        content.location = message.location;
        break;
      case 'contacts':
        content.contacts = message.contacts;
        break;
      case 'interactive':
        content.interactive = message.interactive;
        break;
      case 'reaction':
        content.reaction = message.reaction;
        break;
    }

    return content;
  }

  private getMessagePreview(message: WebhookMessage): string {
    switch (message.type) {
      case 'text':
        return message.text?.body || '';
      case 'image':
        return message.image?.caption || '📷 Image';
      case 'video':
        return message.video?.caption || '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'document':
        return message.document?.filename || '📎 Document';
      case 'sticker':
        return '🎨 Sticker';
      case 'location':
        return `📍 ${message.location?.name || 'Location'}`;
      case 'contacts':
        return '👤 Contact';
      case 'interactive':
        if (message.interactive?.button_reply) {
          return message.interactive.button_reply.title;
        }
        if (message.interactive?.list_reply) {
          return message.interactive.list_reply.title;
        }
        return 'Interactive';
      case 'reaction':
        return message.reaction?.emoji || '👍';
      default:
        return 'Message';
    }
  }

  async retryFailedWebhooks(maxRetries: number = 3): Promise<number> {
    const failedLogs = await WebhookLog.find({
      status: 'failed',
      retryCount: { $lt: maxRetries },
    }).limit(100);

    let retried = 0;

    for (const log of failedLogs) {
      try {
        await this.processWebhook(log.payload as unknown as WebhookPayload);
        retried++;
      } catch {
        await WebhookLog.updateOne(
          { _id: log._id },
          { $inc: { retryCount: 1 } }
        );
      }
    }

    return retried;
  }
}

export const webhookService = new WebhookService();
