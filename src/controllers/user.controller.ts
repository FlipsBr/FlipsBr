import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { ValidationError } from '../utils/errors';

export class UserController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isBlocked = req.query.isBlocked === 'true' ? true : 
                        req.query.isBlocked === 'false' ? false : undefined;
      const tags = req.query.tags 
        ? (req.query.tags as string).split(',') 
        : undefined;

      const result = await userService.list(page, limit, { isBlocked, tags });

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
      const user = await userService.findById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByWaId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { waId } = req.params;
      const user = await userService.findByWaId(waId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { waId } = req.params;
      const { name, profilePicture, customFields } = req.body;

      const user = await userService.update(waId, {
        name,
        profilePicture,
        customFields,
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async block(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { waId } = req.params;
      const user = await userService.blockUser(waId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async unblock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { waId } = req.params;
      const user = await userService.unblockUser(waId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async addTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { waId } = req.params;
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags)) {
        throw new ValidationError('Tags must be an array');
      }

      const user = await userService.addTags(waId, tags);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { waId } = req.params;
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags)) {
        throw new ValidationError('Tags must be an array');
      }

      const user = await userService.removeTags(waId, tags);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query) {
        throw new ValidationError('Search query is required');
      }

      const users = await userService.search(query, limit);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
