import { Router, type IRouter } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { commentsController } from '../controllers/comments.controller.js';
import { CommentSchema } from '@photo-app/shared';

// Mounted under /photos/:id/comments — note: mergeParams needed to access :id
export const photoCommentsRoutes: IRouter = Router({ mergeParams: true });
photoCommentsRoutes.post('/', authenticate, validate(CommentSchema), commentsController.create);

// Mounted under /comments
export const commentsRoutes: IRouter = Router();
commentsRoutes.delete('/:id', authenticate, commentsController.remove);
