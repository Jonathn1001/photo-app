import pinoHttpPkg from 'pino-http';
import { createLogger } from '@photo-app/shared/logging';
import { env } from '../config/env.js';

// pino-http CJS compat: the callable is the default export
const pinoHttp = (pinoHttpPkg as any).default ?? pinoHttpPkg;

const logger = createLogger({ service: 'photo-service', level: env.LOG_LEVEL });

export const httpLogger = pinoHttp({
  logger,
  customProps: (req: any) => ({ requestId: req.requestId, userId: req.userId }),
  serializers: {
    req: (req: any) => ({ method: req.method, url: req.url, requestId: req.requestId }),
    res: (res: any) => ({ status: res.statusCode }),
  },
  customLogLevel: (_req: any, res: any, err: any) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
