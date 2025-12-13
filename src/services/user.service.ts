import { User, IUser } from '../models';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface CreateUserInput {
  waId: string;
  phoneNumber: string;
  name: string;
  profilePicture?: string;
}

export interface UpdateUserInput {
  name?: string;
  profilePicture?: string;
  isBlocked?: boolean;
  tags?: string[];
  customFields?: Record<string, string>;
}

export class UserService {
  async findOrCreate(input: CreateUserInput): Promise<IUser> {
    let user = await User.findOne({ waId: input.waId });
    
    if (!user) {
      user = await User.create(input);
      logger.info(`Created new user: ${input.waId}`);
    } else {
      // Update name if changed
      if (user.name !== input.name) {
        user.name = input.name;
        await user.save();
      }
    }

    return user;
  }

  async findByWaId(waId: string): Promise<IUser | null> {
    return User.findOne({ waId });
  }

  async findById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async update(waId: string, input: UpdateUserInput): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { waId },
      { $set: input },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateLastMessage(waId: string): Promise<void> {
    await User.updateOne(
      { waId },
      { $set: { lastMessageAt: new Date() } }
    );
  }

  async blockUser(waId: string): Promise<IUser> {
    return this.update(waId, { isBlocked: true });
  }

  async unblockUser(waId: string): Promise<IUser> {
    return this.update(waId, { isBlocked: false });
  }

  async addTags(waId: string, tags: string[]): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { waId },
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async removeTags(waId: string, tags: string[]): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { waId },
      { $pullAll: { tags } },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async search(query: string, limit: number = 20): Promise<IUser[]> {
    return User.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);
  }

  async list(
    page: number = 1,
    limit: number = 20,
    filter?: { isBlocked?: boolean; tags?: string[] }
  ): Promise<{ users: IUser[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter?.isBlocked !== undefined) {
      query.isBlocked = filter.isBlocked;
    }

    if (filter?.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total };
  }
}

export const userService = new UserService();
