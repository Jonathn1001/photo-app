import { headers } from 'next/headers';
import { Avatar, Card } from 'antd';
import { PhotoGrid } from '@/components/PhotoGrid';
import { getAccessToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function fetchJson(url: string, token: string, requestId: string) {
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
    fetchJson(`${process.env.USER_SERVICE_URL}/users/${userId}`, token!, requestId),
    fetchJson(`${process.env.PHOTO_SERVICE_URL}/users/${userId}/photos?limit=30`, token!, requestId),
  ]);
  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Avatar src={user.avatarUrl} size={64} />
        <h2 style={{ marginLeft: 16, display: 'inline-block' }}>{user.name}</h2>
      </Card>
      <PhotoGrid items={photos.items} />
    </>
  );
}
