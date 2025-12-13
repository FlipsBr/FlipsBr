import { Router } from 'express';
import { conversationController } from '../controllers';

const router = Router();

// List conversations
router.get('/', conversationController.list.bind(conversationController));

// Get conversation by ID
router.get('/:id', conversationController.getById.bind(conversationController));

// Archive conversation
router.post('/:id/archive', conversationController.archive.bind(conversationController));

// Close conversation
router.post('/:id/close', conversationController.close.bind(conversationController));

// Reopen conversation
router.post('/:id/reopen', conversationController.reopen.bind(conversationController));

// Assign conversation
router.post('/:id/assign', conversationController.assign.bind(conversationController));

// Mark as read
router.post('/:id/read', conversationController.markAsRead.bind(conversationController));

// Manage tags
router.post('/:id/tags', conversationController.addTags.bind(conversationController));
router.delete('/:id/tags', conversationController.removeTags.bind(conversationController));

export default router;
