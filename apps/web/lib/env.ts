import { z } from 'zod';

const Schema = z.object({
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  USER_SERVICE_URL: z.string().url(),
  PHOTO_SERVICE_URL: z.string().url(),
  INTERNAL_SERVICE_SECRET: z.string().min(16),
});

let _env: z.infer<typeof Schema> | undefined;

export function getEnv(): z.infer<typeof Schema> {
  if (!_env) {
    _env = Schema.parse(process.env);
  }
  return _env;
}

// Proxy so existing callers can do `env.NEXTAUTH_SECRET` etc.
export const env = new Proxy({} as z.infer<typeof Schema>, {
  get(_target, key: string) {
    return getEnv()[key as keyof z.infer<typeof Schema>];
  },
});
