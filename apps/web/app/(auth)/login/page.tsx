import { Button } from 'antd';
import { CheckOutlined, GoogleOutlined } from '@ant-design/icons';
import { signIn } from '@/lib/auth';
import { BrandLockup } from '@/components/brand';

export default function LoginPage() {
  async function go() {
    'use server';
    await signIn('google', { redirectTo: '/feed' });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 48,
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <section style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <BrandLockup size={40} />

          <div>
            <h1
              style={{
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#171717',
                margin: 0,
              }}
            >
              Where moments<br />
              become{' '}
              <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#525252' }}>
                memories
              </span>
              .
            </h1>
            <p
              style={{
                marginTop: 24,
                fontSize: 18,
                color: '#737373',
                lineHeight: 1.6,
                maxWidth: 480,
              }}
            >
              A quiet place to share photos with the people who matter. No ads, no algorithm —
              just you and your world.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 24,
              fontSize: 12,
              color: '#a3a3a3',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckOutlined /> End-to-end secure
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckOutlined /> Free forever
            </span>
          </div>
        </section>

        <section style={{ paddingLeft: 24 }}>
          <div
            style={{
              maxWidth: 420,
              background: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: 20,
              padding: 32,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
                Welcome
              </h2>
              <p style={{ marginTop: 4, fontSize: 13, color: '#737373' }}>
                Continue with your Google account to get started.
              </p>
            </div>

            <form action={go}>
              <Button
                htmlType="submit"
                block
                size="large"
                icon={<GoogleOutlined />}
                style={{ height: 48, borderRadius: 12, fontWeight: 500 }}
              >
                Continue with Google
              </Button>
            </form>

            <p style={{ marginTop: 24, fontSize: 12, color: '#a3a3a3', textAlign: 'center' }}>
              By continuing, you agree to our Terms of Service.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
