import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp } from 'antd';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

export const metadata = { title: 'Comsuon — quiet place for photos' };

const theme = {
  token: {
    colorPrimary: '#171717',
    colorLink: '#171717',
    colorBgLayout: '#fafafa',
    colorBgContainer: '#ffffff',
    colorBorder: '#e5e5e5',
    colorBorderSecondary: '#f5f5f5',
    colorText: '#171717',
    colorTextSecondary: '#737373',
    colorTextTertiary: '#a3a3a3',
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    controlHeight: 38,
    fontSize: 14,
  },
  components: {
    Button: { fontWeight: 500, primaryShadow: 'none', defaultShadow: 'none' },
    Card: { borderRadiusLG: 16, paddingLG: 20 },
    Input: { activeShadow: 'none' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{ margin: 0, fontFamily: jakarta.style.fontFamily, background: '#fafafa' }}
      >
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <AntdApp>{children}</AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
