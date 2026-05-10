import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  async google(req: Request, res: Response, next: NextFunction) {
    try { res.json({ data: await authService.loginWithGoogle(req.body) }); } catch (e) { next(e); }
  },
  async refresh(req: Request, res: Response, next: NextFunction) {
    try { res.json({ data: await authService.rotate(req.body.refreshToken) }); } catch (e) { next(e); }
  },
  async signout(req: Request, res: Response, next: NextFunction) {
    try { await authService.signout(req.body.refreshToken); res.status(204).end(); } catch (e) { next(e); }
  },
};
