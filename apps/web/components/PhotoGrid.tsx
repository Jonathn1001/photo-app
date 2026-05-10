import { PhotoCard } from './PhotoCard';

export function PhotoGrid({ items }: { items: { id: string; url: string; format: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
      {items.map(p => <PhotoCard key={p.id} photo={p} />)}
    </div>
  );
}
