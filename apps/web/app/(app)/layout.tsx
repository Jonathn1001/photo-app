import { redirect } from 'next/navigation';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import { getSessionCached } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionCached();
  if (!session) redirect('/login');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session as any).userId;
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header>
        <Menu mode="horizontal" theme="dark" items={[
          { key: 'feed',    label: <Link href="/feed">Feed</Link> },
          { key: 'profile', label: <Link href={`/profile/${userId}`}>Profile</Link> },
        ]} />
      </Layout.Header>
      <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
    </Layout>
  );
}
