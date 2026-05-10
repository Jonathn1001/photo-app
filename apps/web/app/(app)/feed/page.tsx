import { headers } from 'next/headers';
import { PhotoGrid } from '@/components/PhotoGrid';
import { UploadModalLazy } from '@/components/UploadModalLazy';
import { getAccessToken } from '@/lib/session';
import type { FeedPhoto } from '@/components/PhotoCard';

export const dynamic = 'force-dynamic';

async function getFeed(): Promise<{ items: FeedPhoto[] }> {
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
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            Today
          </h1>
          <p style={{ marginTop: 4, fontSize: 14, color: '#737373' }}>
            A quiet feed of recent photos.
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            color: '#a3a3a3',
            textTransform: 'uppercase',
          }}
        >
          {feed.items.length} {feed.items.length === 1 ? 'post' : 'posts'}
        </span>
      </header>

      <UploadModalLazy />

      <div style={{ marginTop: 24 }}>
        <PhotoGrid items={feed.items} />
      </div>
    </div>
  );
}
