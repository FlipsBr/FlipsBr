import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';
import { UnauthorizedError } from '../utils/errors';

export const validateWebhookSignature = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    
    if (!signature) {
      logger.warn('Webhook request missing signature');
      throw new UnauthorizedError('Missing signature');
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.meta.appSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const signatureHash = signature.replace('sha256=', '');

    if (!crypto.timingSafeEqual(
      Buffer.from(signatureHash),
      Buffer.from(expectedSignature)
    )) {
      logger.warn('Invalid webhook signature');
      throw new UnauthorizedError('Invalid signature');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateWebhookVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.meta.webhookVerifyToken) {
    logger.info('Webhook verification successful');
    res.status(200).send(challenge);
    return;
  }

  logger.warn('Webhook verification failed');
  res.status(403).send('Forbidden');
};
