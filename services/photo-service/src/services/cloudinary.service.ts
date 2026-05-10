import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { AppError, ErrorCode } from '@photo-app/shared';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryService = {
  signUpload(input: { folder?: string }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { timestamp, upload_preset: env.CLOUDINARY_UPLOAD_PRESET, folder: input.folder ?? 'photos' };
    const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
    return { ...params, signature, apiKey: env.CLOUDINARY_API_KEY, cloudName: env.CLOUDINARY_CLOUD_NAME };
  },
  async destroy(publicId: string) {
    try { await cloudinary.uploader.destroy(publicId); }
    catch { throw new AppError(ErrorCode.PA_UP_001); }
  },
};
