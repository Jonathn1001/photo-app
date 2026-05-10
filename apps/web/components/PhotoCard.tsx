import Link from 'next/link';
import { timeAgo } from '@/lib/time';

export type FeedPhoto = {
  id: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  createdAt?: string;
};

export function PhotoCard({ photo }: { photo: FeedPhoto }) {
  const aspect = photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 3';
  return (
    <Link
      href={`/photos/${photo.id}`}
      style={{
        display: 'block',
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: 16,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
    >
      <div style={{ aspectRatio: aspect, background: '#f5f5f5', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#737373',
          fontFamily: 'monospace',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <span>{photo.format?.toUpperCase()}</span>
        {photo.createdAt && <span>{timeAgo(photo.createdAt)}</span>}
      </div>
    </Link>
  );
}
