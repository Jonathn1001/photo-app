import { AppError, ErrorCode } from '@photo-app/shared';
import { usersRepo } from '../repositories/users.repo.js';

export const usersService = {
  async getMe(userId: string) {
    const user = await usersRepo.findById(userId);
    if (!user) throw new AppError(ErrorCode.PA_RES_001);
    return user;
  },
  async getPublicProfile(id: string) {
    const user = await usersRepo.findById(id);
    if (!user) throw new AppError(ErrorCode.PA_RES_001);
    const handle = user.email.split('@')[0];
    return { id: user.id, name: user.name, avatarUrl: user.avatarUrl, handle };
  },
};
