import { AppError, ErrorCode, type CommentInput } from '@photo-app/shared';
import { commentsRepo } from '../repositories/comments.repo.js';
import { photosRepo } from '../repositories/photos.repo.js';

export const commentsService = {
  async create(userId: string, photoId: string, input: CommentInput) {
    const photo = await photosRepo.findByIdBare(photoId);
    if (!photo) throw new AppError(ErrorCode.PA_RES_002);
    return commentsRepo.create({ photoId, authorId: userId, content: input.content });
  },
  async remove(userId: string, id: string) {
    const comment = await commentsRepo.findById(id);
    if (!comment) throw new AppError(ErrorCode.PA_RES_003);
    if (comment.authorId !== userId) throw new AppError(ErrorCode.PA_AUTH_010);
    await commentsRepo.delete(id);
  },
};
