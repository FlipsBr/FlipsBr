import { Router } from 'express';
import { webhookController } from '../controllers';
import { 
  validateWebhookSignature, 
  validateWebhookVerification 
} from '../middleware';

const router = Router();

// Webhook verification endpoint (GET)
router.get('/', validateWebhookVerification);

// Webhook event handler (POST)
router.post(
  '/',
  validateWebhookSignature,
  webhookController.handleIncoming.bind(webhookController)
);

export default router;
