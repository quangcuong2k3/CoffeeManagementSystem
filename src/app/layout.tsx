import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../shared/styles/globals.css';
import { AuthProvider } from '@/infra/api/hooks/authHooks';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coffee House - Management System',
  description: 'Comprehensive backend management system for Coffee House application',
  keywords: ['coffee', 'management', 'admin', 'dashboard', 'analytics'],
  authors: [{ name: 'Coffee House Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
