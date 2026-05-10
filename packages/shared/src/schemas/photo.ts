import { z } from 'zod';

export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_BYTES = 5 * 1024 * 1024;

export const SignUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME),
  bytes: z.number().int().positive().max(MAX_BYTES),
});

export const CreatePhotoSchema = z.object({
  publicId: z.string().min(1).max(255),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive().max(MAX_BYTES),
  format: z.enum(['jpg', 'jpeg', 'png', 'webp']),
});

export type SignUploadInput = z.infer<typeof SignUploadSchema>;
export type CreatePhotoInput = z.infer<typeof CreatePhotoSchema>;
