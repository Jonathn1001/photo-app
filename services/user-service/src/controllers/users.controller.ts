import type { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service.js';

export const usersController = {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getMe(req.userId!);
      res.json({ data: user });
    } catch (e) { next(e); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.getPublicProfile(req.params.id);
      res.json({ data: profile });
    } catch (e) { next(e); }
  },
};
