import { Button, Card } from 'antd';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  async function go() { 'use server'; await signIn('google', { redirectTo: '/feed' }); }
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <Card title="Photo App">
        <form action={go}>
          <Button htmlType="submit" type="primary">Sign in with Google</Button>
        </form>
      </Card>
    </div>
  );
}
