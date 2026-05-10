import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { apiRegistry } from '@photo-app/shared/openapi';
import { GoogleProfileSchema, RefreshTokenSchema } from '@photo-app/shared';
import { z } from 'zod';

extendZodWithOpenApi(z);

apiRegistry.register('GoogleProfile', GoogleProfileSchema);
apiRegistry.register('RefreshTokenInput', RefreshTokenSchema);

const TokenPair = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({ id: z.string(), email: z.string(), name: z.string(), avatarUrl: z.string().nullable() }),
});

apiRegistry.registerPath({
  method: 'post', path: '/auth/google',
  description: 'Internal: upsert Google user, return tokens',
  request: { body: { content: { 'application/json': { schema: GoogleProfileSchema } } } },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: z.object({ data: TokenPair }) } } } },
});
apiRegistry.registerPath({
  method: 'post', path: '/auth/refresh',
  request: { body: { content: { 'application/json': { schema: RefreshTokenSchema } } } },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: z.object({ data: TokenPair }) } } } },
});
apiRegistry.registerPath({
  method: 'get', path: '/users/me',
  responses: { 200: { description: 'OK' } },
});
apiRegistry.registerPath({
  method: 'get', path: '/users/{id}',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
});
