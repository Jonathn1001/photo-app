import { apiRegistry } from '@photo-app/shared/openapi';
import { SignUploadSchema, CreatePhotoSchema, CommentSchema } from '@photo-app/shared';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
extendZodWithOpenApi(z);

apiRegistry.register('SignUpload', SignUploadSchema);
apiRegistry.register('CreatePhoto', CreatePhotoSchema);
apiRegistry.register('Comment', CommentSchema);

const Photo = z.object({
  id: z.string(), ownerId: z.string(), url: z.string(), publicId: z.string(),
  width: z.number(), height: z.number(), bytes: z.number(), format: z.string(),
  createdAt: z.string(),
});

apiRegistry.registerPath({ method: 'post', path: '/photos/sign-upload', request: { body: { content: { 'application/json': { schema: SignUploadSchema } } } }, responses: { 200: { description: 'OK' } } });
apiRegistry.registerPath({ method: 'post', path: '/photos', request: { body: { content: { 'application/json': { schema: CreatePhotoSchema } } } }, responses: { 201: { description: 'Created', content: { 'application/json': { schema: z.object({ data: Photo }) } } } } });
apiRegistry.registerPath({ method: 'get',  path: '/photos', responses: { 200: { description: 'OK' } } });
apiRegistry.registerPath({ method: 'get',  path: '/photos/{id}', request: { params: z.object({ id: z.string() }) }, responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } });
apiRegistry.registerPath({ method: 'delete', path: '/photos/{id}', request: { params: z.object({ id: z.string() }) }, responses: { 204: { description: 'No Content' }, 403: { description: 'Forbidden' } } });
apiRegistry.registerPath({ method: 'post', path: '/photos/{id}/comments', request: { params: z.object({ id: z.string() }), body: { content: { 'application/json': { schema: CommentSchema } } } }, responses: { 201: { description: 'Created' } } });
apiRegistry.registerPath({ method: 'delete', path: '/comments/{id}', request: { params: z.object({ id: z.string() }) }, responses: { 204: { description: 'No Content' } } });
apiRegistry.registerPath({ method: 'get',  path: '/users/{userId}/photos', request: { params: z.object({ userId: z.string() }) }, responses: { 200: { description: 'OK' } } });
