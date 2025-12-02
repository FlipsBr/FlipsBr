import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services';
import { WebhookPayload } from '../types';
import { logger } from '../utils/logger';

export class WebhookController {
  async handleIncoming(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as WebhookPayload;
      
      // Respond immediately to acknowledge receipt
      res.status(200).send('EVENT_RECEIVED');

      // Process webhook asynchronously
      webhookService.processWebhook(payload).catch((error) => {
        logger.error('Error processing webhook:', error);
      });
    } catch (error) {
      next(error);
    }
  }
}

export const webhookController = new WebhookController();
