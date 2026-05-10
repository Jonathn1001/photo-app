import { cache } from 'react';
import { auth } from './auth';

export const getSessionCached = cache(async () => auth());

export async function getAccessToken(): Promise<string | null> {
  const s = await getSessionCached();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (s as any)?.appAccessToken ?? null;
}
