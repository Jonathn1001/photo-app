import { headers } from 'next/headers';
import { CommentList } from '@/components/CommentList';
import { CommentForm } from '@/components/CommentForm';
import { getAccessToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function getPhoto(id: string) {
  const token = await getAccessToken();
  const h = await headers();
  const res = await fetch(`${process.env.PHOTO_SERVICE_URL}/photos/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-request-id': h.get('x-request-id') ?? crypto.randomUUID(),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('photo fetch failed');
  return (await res.json()).data;
}

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await getPhoto(id);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt="" style={{ maxWidth: '100%' }} />
      <div>
        <CommentList items={photo.comments} />
        <CommentForm photoId={photo.id} />
      </div>
    </div>
  );
}
