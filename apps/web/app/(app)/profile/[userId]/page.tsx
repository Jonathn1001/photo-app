import { headers } from 'next/headers';
import { PhotoGrid } from '@/components/PhotoGrid';
import { GradientAvatar } from '@/components/brand';
import { getAccessToken } from '@/lib/session';
import type { FeedPhoto } from '@/components/PhotoCard';

export const dynamic = 'force-dynamic';

type User = { id: string; name: string; email: string; avatarUrl: string | null };

async function fetchJson<T>(url: string, token: string, requestId: string): Promise<T> {
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-request-id': requestId },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return (await r.json()).data;
}

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const token = await getAccessToken();
  const h = await headers();
  const requestId = h.get('x-request-id') ?? crypto.randomUUID();
  const [user, photos] = await Promise.all([
    fetchJson<User>(`${process.env.USER_SERVICE_URL}/users/${userId}`, token!, requestId),
    fetchJson<{ items: FeedPhoto[] }>(
      `${process.env.PHOTO_SERVICE_URL}/users/${userId}/photos?limit=30`,
      token!,
      requestId,
    ),
  ]);

  const handle = user.email.split('@')[0];

  return (
    <div>
      <header
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 24,
          paddingBottom: 32,
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <GradientAvatar name={user.name} src={user.avatarUrl} size={112} radius={20} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              {user.name}
            </h1>
            <span style={{ fontSize: 13, color: '#a3a3a3', fontFamily: 'monospace' }}>@{handle}</span>
          </div>
          <p style={{ marginTop: 8, color: '#737373', fontSize: 14, lineHeight: 1.6, maxWidth: 560 }}>
            {photos.items.length === 0
              ? 'No photos yet.'
              : `${photos.items.length} photo${photos.items.length === 1 ? '' : 's'} shared.`}
          </p>
        </div>
      </header>

      <div style={{ marginTop: 32 }}>
        <PhotoGrid items={photos.items} minColWidth={220} />
      </div>
    </div>
  );
}
