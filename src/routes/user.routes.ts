import { Router } from 'express';
import { userController } from '../controllers';

const router = Router();

// List users
router.get('/', userController.list.bind(userController));

// Search users
router.get('/search', userController.search.bind(userController));

// Get user by ID
router.get('/:id', userController.getById.bind(userController));

// Get user by WhatsApp ID
router.get('/wa/:waId', userController.getByWaId.bind(userController));

// Update user
router.patch('/wa/:waId', userController.update.bind(userController));

// Block/Unblock user
router.post('/wa/:waId/block', userController.block.bind(userController));
router.post('/wa/:waId/unblock', userController.unblock.bind(userController));

// Manage tags
router.post('/wa/:waId/tags', userController.addTags.bind(userController));
router.delete('/wa/:waId/tags', userController.removeTags.bind(userController));

export default router;
