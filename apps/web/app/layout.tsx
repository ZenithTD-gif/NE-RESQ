import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'NE-RESQ — Northeast Emergency Response, Disaster Intelligence & Safety Platform',
  description: 'One Region. One Network. One Mission — Saving Lives. Advanced disaster management, flood monitoring, landslide intelligence, and emergency SOS platform for all eight Northeast Indian states.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#F8F9FC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8F9FC] text-[#20232A]">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
