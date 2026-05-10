import { Router, type IRouter } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { usersController } from '../controllers/users.controller.js';

export const usersRoutes: IRouter = Router();
usersRoutes.get('/me', authenticate, usersController.me);
usersRoutes.get('/:id', authenticate, usersController.getById);
