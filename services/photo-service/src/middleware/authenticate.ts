import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, ErrorCode } from '@photo-app/shared';
import { env } from '../config/env.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return next(new AppError(ErrorCode.PA_AUTH_001));
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') return next(new AppError(ErrorCode.PA_AUTH_003));
    return next(new AppError(ErrorCode.PA_AUTH_002));
  }
};
