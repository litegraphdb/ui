'use client';
import { Inter } from 'next/font/google';
import '@/assets/css/globals.scss';
import StoreProvider from '@/lib/store/StoreProvider';
import { Toaster } from 'react-hot-toast';
import { ConfigProvider } from 'antd';
import { darkTheme, primaryTheme } from '@/theme/theme';
import AuthLayout from '@/components/layout/AuthLayout';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { StyleProvider } from '@ant-design/cssinjs';
import { AppContext } from '@/hooks/appHooks';
import { useState } from 'react';
import { ThemeEnum } from '@/types/types';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<ThemeEnum>(ThemeEnum.LIGHT);
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link
          rel="apple-touch-icon"
          href="/bombe-icon-3x.png?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <StoreProvider>
          <AppContext.Provider value={{ theme, setTheme }}>
            <StyleProvider hashPriority="high">
              <AntdRegistry>
                <ConfigProvider theme={theme === ThemeEnum.LIGHT ? primaryTheme : darkTheme}>
                  <AuthLayout>{children}</AuthLayout>
                  <Toaster />
                </ConfigProvider>
              </AntdRegistry>
            </StyleProvider>{' '}
          </AppContext.Provider>
        </StoreProvider>
      </body>
    </html>
  );
}
