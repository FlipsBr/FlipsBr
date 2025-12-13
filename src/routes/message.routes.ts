import { Router } from 'express';
import { messageController } from '../controllers';

const router = Router();

// Send messages
router.post('/text', messageController.sendText.bind(messageController));
router.post('/image', messageController.sendImage.bind(messageController));
router.post('/video', messageController.sendVideo.bind(messageController));
router.post('/document', messageController.sendDocument.bind(messageController));
router.post('/template', messageController.sendTemplate.bind(messageController));
router.post('/interactive', messageController.sendInteractive.bind(messageController));
router.post('/location', messageController.sendLocation.bind(messageController));
router.post('/reaction', messageController.sendReaction.bind(messageController));

// Mark message as read
router.post('/:messageId/read', messageController.markAsRead.bind(messageController));

// Get messages for a conversation
router.get('/conversation/:conversationId', messageController.getMessages.bind(messageController));

export default router;
