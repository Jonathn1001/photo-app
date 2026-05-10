import pino, { type Logger, type LoggerOptions, type DestinationStream } from 'pino';

export interface CreateLoggerOptions {
  service: string;
  level?: pino.Level;
  stream?: DestinationStream;
}

const REDACT_PATHS = [
  'password', '*.password',
  'token', '*.token', 'accessToken', '*.accessToken', 'refreshToken', '*.refreshToken',
  'authorization', '*.authorization',
  'cookie', '*.cookie',
  'apiKey', '*.apiKey', 'api_secret', '*.api_secret', 'api_key', '*.api_key',
  'secret', '*.secret',
  'req.headers.authorization', 'req.headers.cookie', 'req.headers["x-internal-secret"]',
  'res.headers["set-cookie"]',
  'headers.authorization', 'headers.cookie',
];

export function createLogger(opts: CreateLoggerOptions): Logger {
  const options: LoggerOptions = {
    level: opts.level ?? (process.env.LOG_LEVEL as pino.Level) ?? 'info',
    base: {
      service: opts.service,
      env: process.env.NODE_ENV ?? 'development',
      version: process.env.npm_package_version ?? '0.0.0',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]', remove: false },
  };
  return opts.stream ? pino(options, opts.stream) : pino(options);
}
