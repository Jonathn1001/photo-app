import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: Source = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse((req as any)[source]);
    if (!result.success) return next(result.error);
    (req as any)[source] = result.data;
    next();
  };
}
