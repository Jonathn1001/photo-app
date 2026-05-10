import { z } from 'zod';

export const GoogleProfileSchema = z.object({
  googleId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(20),
});

export type GoogleProfileInput = z.infer<typeof GoogleProfileSchema>;
