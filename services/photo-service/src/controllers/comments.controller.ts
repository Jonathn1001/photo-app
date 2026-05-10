import type { Request, Response, NextFunction } from 'express';
import { commentsService } from '../services/comments.service.js';

export const commentsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await commentsService.create(req.userId!, req.params.id, req.body);
      res.status(201).json({ data: comment });
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await commentsService.remove(req.userId!, req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  },
};
