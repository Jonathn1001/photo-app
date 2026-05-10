import type { Request, Response, NextFunction } from 'express';
import { photosService } from '../services/photos.service.js';
import { z } from 'zod';

const FeedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const photosController = {
  async signUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const data = photosService.signUpload(req.userId!, req.body);
      res.json({ data });
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const photo = await photosService.create(req.userId!, req.body);
      res.status(201).json({ data: photo });
    } catch (e) { next(e); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const photo = await photosService.getById(req.params.id);
      res.json({ data: photo });
    } catch (e) { next(e); }
  },
  async feed(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = FeedQuerySchema.safeParse(req.query);
      const opts = parsed.success ? parsed.data : { limit: 20 };
      const result = await photosService.feed(opts);
      res.json({ data: result });
    } catch (e) { next(e); }
  },
  async userFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = FeedQuerySchema.safeParse(req.query);
      const opts = parsed.success ? parsed.data : { limit: 20 };
      const result = await photosService.feed({ ...opts, ownerId: req.params.userId });
      res.json({ data: result });
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await photosService.remove(req.userId!, req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  },
};
