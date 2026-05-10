import { z } from 'zod';

export const CommentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment exceeds 500 characters')
    .refine((s) => s.trim().length > 0, 'Comment cannot be whitespace only'),
});
export type CommentInput = z.infer<typeof CommentSchema>;
