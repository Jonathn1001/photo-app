import type { Request, Response, NextFunction } from 'express';
import { ulid } from 'ulid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      userId?: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.header('x-request-id') ?? ulid());
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}
