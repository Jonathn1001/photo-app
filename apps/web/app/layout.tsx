import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';

export const metadata = { title: 'Photo App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ConfigProvider>{children}</ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
