import { createApp } from './app.js';
import { env } from './config/env.js';
import { createLogger } from '@photo-app/shared/logging';
import { prisma } from './prisma.js';

const logger = createLogger({ service: 'photo-service', level: env.LOG_LEVEL });
const app = createApp();
const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'photo-service listening'));

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
