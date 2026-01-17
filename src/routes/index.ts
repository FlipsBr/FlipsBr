import { Router } from 'express';
import webhookRoutes from './webhook.routes';
import messageRoutes from './message.routes';
import conversationRoutes from './conversation.routes';
import userRoutes from './user.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/webhook', webhookRoutes);
router.use('/messages', messageRoutes);
router.use('/conversations', conversationRoutes);
router.use('/users', userRoutes);

export default router;
