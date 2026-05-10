import { List } from 'antd';
export function CommentList({ items }: { items: { id: string; authorId: string; content: string; createdAt: string }[] }) {
  return <List dataSource={items} renderItem={c => <List.Item key={c.id}>{c.content}</List.Item>} />;
}
