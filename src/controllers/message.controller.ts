import { Request, Response, NextFunction } from 'express';
import { whatsAppService } from '../services';
import { messageService, conversationService, userService } from '../services';
import { ValidationError } from '../utils/errors';
import { config } from '../config';

export class MessageController {
  async sendText(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, text, replyTo } = req.body;

      if (!to || !text) {
        throw new ValidationError('Missing required fields: to, text');
      }

      const response = await whatsAppService.sendTextMessage(
        to,
        { body: text },
        replyTo
      );

      // Find or create user and conversation
      const user = await userService.findOrCreate({
        waId: to,
        phoneNumber: to,
        name: to,
      });

      const conversation = await conversationService.findOrCreate({
        userId: user._id,
        phoneNumber: to,
      });

      // Save message to database
      const savedMessage = await messageService.create({
        conversationId: conversation._id,
        messageId: response.messages[0].id,
        from: config.meta.phoneNumberId,
        to,
        type: 'text',
        content: { text: { body: text } },
        direction: 'outbound',
        timestamp: new Date(),
        contextMessageId: replyTo,
        status: 'sent',
      });

      // Update conversation
      await conversationService.updateLastMessage(
        conversation._id,
        savedMessage._id,
        text
      );

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
          waId: response.contacts[0].wa_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, imageId, imageUrl, caption, replyTo } = req.body;

      if (!to || (!imageId && !imageUrl)) {
        throw new ValidationError('Missing required fields: to, imageId or imageUrl');
      }

      const image = imageId ? { id: imageId, caption } : { link: imageUrl, caption };
      const response = await whatsAppService.sendImageMessage(to, image, replyTo);

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
          waId: response.contacts[0].wa_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, videoId, videoUrl, caption, replyTo } = req.body;

      if (!to || (!videoId && !videoUrl)) {
        throw new ValidationError('Missing required fields: to, videoId or videoUrl');
      }

      const video = videoId ? { id: videoId, caption } : { link: videoUrl, caption };
      const response = await whatsAppService.sendVideoMessage(to, video, replyTo);

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
          waId: response.contacts[0].wa_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, documentId, documentUrl, caption, filename, replyTo } = req.body;

      if (!to || (!documentId && !documentUrl)) {
        throw new ValidationError('Missing required fields: to, documentId or documentUrl');
      }

      const document = documentId 
        ? { id: documentId, caption, filename } 
        : { link: documentUrl, caption, filename };
      const response = await whatsAppService.sendDocumentMessage(to, document, replyTo);

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
          waId: response.contacts[0].wa_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, templateName, language, components } = req.body;

      if (!to || !templateName || !language) {
        throw new ValidationError('Missing required fields: to, templateName, language');
      }

      const response = await whatsAppService.sendTemplateMessage(to, {
        name: templateName,
        language: { code: language },
        components,
      });

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
          waId: response.contacts[0].wa_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendInteractive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, interactive, replyTo } = req.body;

      if (!to || !interactive) {
        throw new ValidationError('Missing required fields: to, interactive');
      }

      const response = await whatsAppService.sendInteractiveMessage(to, interactive, replyTo);

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
          waId: response.contacts[0].wa_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, latitude, longitude, name, address, replyTo } = req.body;

      if (!to || latitude === undefined || longitude === undefined) {
        throw new ValidationError('Missing required fields: to, latitude, longitude');
      }

      const response = await whatsAppService.sendLocationMessage(
        to,
        { latitude, longitude, name, address },
        replyTo
      );

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
          waId: response.contacts[0].wa_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, messageId, emoji } = req.body;

      if (!to || !messageId || !emoji) {
        throw new ValidationError('Missing required fields: to, messageId, emoji');
      }

      const response = await whatsAppService.sendReactionMessage(to, {
        message_id: messageId,
        emoji,
      });

      res.status(200).json({
        success: true,
        data: {
          messageId: response.messages[0].id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        throw new ValidationError('Missing messageId');
      }

      await whatsAppService.markAsRead(messageId);

      res.status(200).json({
        success: true,
        message: 'Message marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await messageService.getConversationMessages(
        conversationId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
