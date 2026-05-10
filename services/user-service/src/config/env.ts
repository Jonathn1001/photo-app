import { z } from 'zod';

const Schema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(4001),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  INTERNAL_SERVICE_SECRET: z.string().min(16),
  LOG_LEVEL: z.enum(['trace','debug','info','warn','error','fatal']).default('info'),
  NODE_ENV: z.enum(['development','production','test']).default('development'),
});

export const env = Schema.parse(process.env);
export type Env = typeof env;
