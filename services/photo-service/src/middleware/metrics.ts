import type { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status', 'code'],
  registers: [register],
});
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpDuration.startTimer({ method: req.method, route: req.route?.path ?? req.path });
  res.on('finish', () => {
    end();
    httpRequests.inc({
      method: req.method,
      route: req.route?.path ?? req.path,
      status: String(res.statusCode),
      code: (res as any).appCode ?? '',
    });
  });
  next();
}

export async function metricsHandler(_req: Request, res: Response) {
  res.setHeader('content-type', register.contentType);
  res.send(await register.metrics());
}
