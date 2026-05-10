import { GradientAvatar } from './brand';
import { timeAgo } from '@/lib/time';

export type Comment = {
  id: string;
  authorId: string;
  authorName?: string | null;
  content: string;
  createdAt: string;
};

export function CommentList({ items }: { items: Comment[] }) {
  if (items.length === 0) {
    return (
      <div style={{ fontSize: 13, color: '#a3a3a3', padding: '12px 0' }}>
        No comments yet — be the first.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((c) => {
        const name = c.authorName || `User ${c.authorId.slice(0, 6)}`;
        return (
          <div key={c.id} style={{ display: 'flex', gap: 12 }}>
            <GradientAvatar name={name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#171717' }}>{name}</span>
                <span style={{ fontSize: 11, color: '#a3a3a3' }}>{timeAgo(c.createdAt)}</span>
              </div>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 13,
                  color: '#525252',
                  lineHeight: 1.5,
                  overflowWrap: 'anywhere',
                }}
              >
                {c.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
