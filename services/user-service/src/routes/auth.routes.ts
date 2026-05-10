import { Router, type IRouter } from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleProfileSchema, RefreshTokenSchema } from '@photo-app/shared';
import { validate } from '../middleware/validate.js';
import { internalSecret } from '../middleware/internalSecret.js';
import { authenticate } from '../middleware/authenticate.js';
import { authController } from '../controllers/auth.controller.js';

const authLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true });

export const authRoutes: IRouter = Router();
authRoutes.post('/google',  internalSecret, validate(GoogleProfileSchema), authController.google);
authRoutes.post('/refresh', authLimiter, validate(RefreshTokenSchema), authController.refresh);
authRoutes.post('/signout', authenticate, validate(RefreshTokenSchema), authController.signout);
