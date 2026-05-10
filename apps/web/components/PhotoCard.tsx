import { Card } from 'antd';
import Link from 'next/link';

export function PhotoCard({ photo }: { photo: { id: string; url: string; format: string } }) {
  return (
    <Link href={`/photos/${photo.id}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
    <Card hoverable cover={<img alt="" src={photo.url} style={{ aspectRatio: '1 / 1', objectFit: 'cover' }} />} />
    </Link>
  );
}
