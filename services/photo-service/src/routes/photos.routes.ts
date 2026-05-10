import { Router, type IRouter } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { photosController } from '../controllers/photos.controller.js';
import { SignUploadSchema, CreatePhotoSchema } from '@photo-app/shared';

export const photosRoutes: IRouter = Router();

photosRoutes.post('/sign-upload', authenticate, validate(SignUploadSchema), photosController.signUpload);
photosRoutes.post('/', authenticate, validate(CreatePhotoSchema), photosController.create);
photosRoutes.get('/', photosController.feed);
photosRoutes.get('/:id', photosController.getById);
photosRoutes.delete('/:id', authenticate, photosController.remove);

export const userPhotosRoutes: IRouter = Router();
userPhotosRoutes.get('/:userId/photos', photosController.userFeed);
