import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../services';
import { ConversationStatus } from '../types';

export class ConversationController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as ConversationStatus | undefined;
      const assignedTo = req.query.assignedTo as string | undefined;
      const tags = req.query.tags 
        ? (req.query.tags as string).split(',') 
        : undefined;

      const result = await conversationService.list(page, limit, {
        status,
        assignedTo,
        tags,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = await conversationService.findById(id);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = await conversationService.archive(id);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = await conversationService.close(id);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async reopen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = await conversationService.reopen(id);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { assignee } = req.body;
      const conversation = await conversationService.assignTo(id, assignee);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await conversationService.markAsRead(id);

      res.status(200).json({
        success: true,
        message: 'Conversation marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async addTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { tags } = req.body;
      const conversation = await conversationService.addTags(id, tags);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { tags } = req.body;
      const conversation = await conversationService.removeTags(id, tags);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();
