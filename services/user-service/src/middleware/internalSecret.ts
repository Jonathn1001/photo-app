import type { RequestHandler } from 'express';
import { AppError, ErrorCode } from '@photo-app/shared';
import { env } from '../config/env.js';

export const internalSecret: RequestHandler = (req, _res, next) => {
  const provided = req.header('x-internal-secret');
  if (!provided || provided !== env.INTERNAL_SERVICE_SECRET) {
    return next(new AppError(ErrorCode.PA_AUTH_011));
  }
  next();
};
