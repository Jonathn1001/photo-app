import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { requestId } from './middleware/requestId.js';
import { httpLogger } from './middleware/httpLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { metricsMiddleware, metricsHandler } from './middleware/metrics.js';
import { authRoutes } from './routes/auth.routes.js';
import { usersRoutes } from './routes/users.routes.js';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiDocument } from '@photo-app/shared/openapi';
import './openapi/register.js';

export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: process.env.GATEWAY_ORIGIN ?? true, credentials: false }));
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(requestId);
  app.use(httpLogger);
  app.use(metricsMiddleware);

  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  app.get('/metrics', metricsHandler);
  app.get('/openapi.json', (_req, res) => res.json(buildOpenApiDocument({ title: 'user-service', version: '1.0.0' })));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(buildOpenApiDocument({ title: 'user-service', version: '1.0.0' })));

  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);

  app.use(errorHandler);
  return app;
}
