import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getSessionCached, getAccessToken } from '@/lib/session';
import { signOut } from '@/lib/auth';
import { BrandLockup } from '@/components/brand';
import { UserMenu } from '@/components/UserMenu';

export const dynamic = 'force-dynamic';

async function getMe() {
  const token = await getAccessToken();
  if (!token) return null;
  const h = await headers();
  try {
    const res = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
      headers: {
        authorization: `Bearer ${token}`,
        'x-request-id': h.get('x-request-id') ?? crypto.randomUUID(),
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()).data as { id: string; name: string; email: string; avatarUrl: string | null };
  } catch {
    return null;
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionCached();
  if (!session) redirect('/login');
  const me = await getMe();
  const userId = me?.id ?? (session as { userId?: string }).userId ?? '';
  const name = me?.name ?? 'You';

  async function signOutAction() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'saturate(180%) blur(16px)',
          WebkitBackdropFilter: 'saturate(180%) blur(16px)',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/feed" style={{ color: 'inherit', textDecoration: 'none' }}>
            <BrandLockup size={32} />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href="/feed" style={navLink}>
              Feed
            </Link>
            <Link href={`/profile/${userId}`} style={navLink}>
              Profile
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/feed?upload=1">
              <Button type="primary" size="small" icon={<UploadOutlined />}>
                Upload
              </Button>
            </Link>
            <UserMenu
              userId={userId}
              name={name}
              avatarUrl={me?.avatarUrl}
              signOutAction={signOutAction}
            />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>{children}</main>
    </div>
  );
}

const navLink: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 13,
  fontWeight: 500,
  color: '#525252',
  borderRadius: 8,
  textDecoration: 'none',
};
