import { PhotoCard, type FeedPhoto } from './PhotoCard';

export function PhotoGrid({
  items,
  minColWidth = 240,
  gap = 16,
}: {
  items: FeedPhoto[];
  minColWidth?: number;
  gap?: number;
}) {
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          color: '#a3a3a3',
          background: '#fff',
          border: '1px dashed #e5e5e5',
          borderRadius: 16,
        }}
      >
        No photos yet.
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}px, 1fr))`,
        gap,
      }}
    >
      {items.map((p) => (
        <PhotoCard key={p.id} photo={p} />
      ))}
    </div>
  );
}
