import { headers } from 'next/headers';
import { PhotoGrid } from '@/components/PhotoGrid';
import { UploadModalLazy } from '@/components/UploadModalLazy';
import { getAccessToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function getFeed() {
  const token = await getAccessToken();
  const h = await headers();
  const res = await fetch(`${process.env.PHOTO_SERVICE_URL}/photos?limit=30`, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-request-id': h.get('x-request-id') ?? crypto.randomUUID(),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('feed failed');
  return (await res.json()).data;
}

export default async function FeedPage() {
  const feed = await getFeed();
  return (
    <>
      <UploadModalLazy />
      <PhotoGrid items={feed.items} />
    </>
  );
}
