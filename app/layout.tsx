import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AnnouncerProvider } from '@/components/Announcer';
import { CartProvider } from '@/lib/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyBottomBar } from '@/components/StickyBottomBar';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://emarigrill.com'),
  title: 'Emari Grill | Flame-Grilled Chicken in Uyo, Akwa Ibom',
  description:
    'Hot, juicy, authentic flame-grilled chicken. Order online with simple bank transfer and fast delivery across Uyo and interstate.',
  applicationName: 'Emari Grill',
  keywords: [
    'Emari Grill',
    'Grilled Chicken Uyo',
    'Chicken in Uyo',
    'Akwa Ibom Food Delivery',
    'Flame Grilled Chicken Nigeria',
  ],
  authors: [{ name: 'Emari Grill' }],
  creator: 'Emari Grill',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://emarigrill.com',
    siteName: 'Emari Grill',
    title: 'Emari Grill | Flame-Grilled Chicken in Uyo',
    description:
      'Hot, juicy, authentic flame-grilled chicken. Order online with fast delivery in Uyo and interstate.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Emari Grill - Hot & Juicy Flame-Grilled Chicken in Uyo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emari Grill | Flame-Grilled Chicken in Uyo',
    description:
      'Hot, juicy, authentic flame-grilled chicken. Order online with fast delivery in Uyo and interstate.',
    images: ['/og-image.svg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#C2410C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Supports zoom up to 500% for WCAG 2.2 AA
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-offwhite text-brand-charcoal-900 selection:bg-brand-fire-100 selection:text-brand-fire-900">
        <AnnouncerProvider>
          <CartProvider>
            {/* Skip to Content Link for Keyboard and Screen Reader Accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-charcoal-900 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-2xl focus:ring-2 focus:ring-brand-fire-600"
            >
              Skip to main content
            </a>

            <Header />

            <main id="main-content" className="flex-1 focus:outline-none">
              {children}
            </main>

            <Footer />

            <StickyBottomBar />
          </CartProvider>
        </AnnouncerProvider>
      </body>
    </html>
  );
}
