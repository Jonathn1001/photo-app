import Link from 'next/link';
import { headers } from 'next/headers';
import { LeftOutlined } from '@ant-design/icons';
import { CommentList, type Comment } from '@/components/CommentList';
import { CommentForm } from '@/components/CommentForm';
import { GradientAvatar } from '@/components/brand';
import { getAccessToken } from '@/lib/session';
import { timeAgo } from '@/lib/time';

export const dynamic = 'force-dynamic';

type Photo = {
  id: string;
  ownerId: string;
  url: string;
  width?: number;
  height?: number;
  createdAt: string;
  comments: Comment[];
};

async function getPhoto(id: string): Promise<Photo> {
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
  const ownerName = `User ${photo.ownerId.slice(0, 6)}`;

  return (
    <div>
      <Link
        href="/feed"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: '#737373',
          textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <LeftOutlined style={{ fontSize: 12 }} /> Back to feed
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
          gap: 0,
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <div style={{ background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt=""
            style={{ width: '100%', height: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f5f5f5',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Link
              href={`/profile/${photo.ownerId}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit', textDecoration: 'none' }}
            >
              <GradientAvatar name={ownerName} size={36} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{ownerName}</div>
                <div style={{ fontSize: 11, color: '#a3a3a3' }}>{timeAgo(photo.createdAt)}</div>
              </div>
            </Link>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                color: '#a3a3a3',
                textTransform: 'uppercase',
              }}
            >
              {photo.comments.length} {photo.comments.length === 1 ? 'Comment' : 'Comments'}
            </span>
            <CommentList items={photo.comments} />
          </div>

          <div style={{ borderTop: '1px solid #f5f5f5', padding: '16px 24px' }}>
            <CommentForm photoId={photo.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
