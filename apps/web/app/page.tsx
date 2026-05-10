import { redirect } from 'next/navigation';
import { getSessionCached } from '@/lib/session';

export const dynamic = 'force-dynamic';
export default async function Home() {
  const s = await getSessionCached();
  redirect(s ? '/feed' : '/login');
}
