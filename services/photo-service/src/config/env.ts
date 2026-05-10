import { z } from 'zod';

const Schema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(4002),
  JWT_SECRET: z.string().min(32),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_PRESET: z.string().min(1),
  USER_SERVICE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['trace','debug','info','warn','error','fatal']).default('info'),
  NODE_ENV: z.enum(['development','production','test']).default('development'),
});

export const env = Schema.parse(process.env);
export type Env = typeof env;
