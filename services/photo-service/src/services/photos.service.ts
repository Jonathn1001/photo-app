import { AppError, ErrorCode, type SignUploadInput, type CreatePhotoInput } from '@photo-app/shared';
import { photosRepo } from '../repositories/photos.repo.js';
import { cloudinaryService } from './cloudinary.service.js';

export const photosService = {
  signUpload(_userId: string, _input: SignUploadInput) {
    return cloudinaryService.signUpload({ folder: 'photos' });
  },
  async create(userId: string, input: CreatePhotoInput) {
    if (!input.publicId.startsWith('photos/')) throw new AppError(ErrorCode.PA_FILE_003);
    return photosRepo.create({ ownerId: userId, ...input });
  },
  async getById(id: string) {
    const p = await photosRepo.findById(id);
    if (!p) throw new AppError(ErrorCode.PA_RES_002);
    return p;
  },
  async feed(opts: { cursor?: string; limit: number; ownerId?: string }) {
    const items = await photosRepo.feed(opts);
    const nextCursor = items.length === opts.limit ? items[items.length - 1].id : null;
    return { items, nextCursor };
  },
  async remove(userId: string, id: string) {
    const p = await photosRepo.findByIdBare(id);
    if (!p) throw new AppError(ErrorCode.PA_RES_002);
    if (p.ownerId !== userId) throw new AppError(ErrorCode.PA_AUTH_010);
    await cloudinaryService.destroy(p.publicId);
    await photosRepo.delete(id);
  },
};
