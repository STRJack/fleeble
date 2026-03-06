import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = 'https://fleeble.app';
const TITLE = 'Fleeble — Smart Notifications for AI Coding Tools';
const DESCRIPTION =
  'Beautiful desktop notifications for Claude Code, Cursor, and Codex. Approve tool calls, answer questions, and manage AI agents — all from native macOS bubbles.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | Fleeble',
  },
  description: DESCRIPTION,
  applicationName: 'Fleeble',
  authors: [{ name: 'STRJack', url: 'https://github.com/STRJack' }],
  creator: 'STRJack',
  publisher: 'STRJack',
  keywords: [
    'Fleeble',
    'Claude Code',
    'Cursor',
    'Codex',
    'AI notifications',
    'macOS',
    'desktop notifications',
    'AI coding tools',
    'developer tools',
    'menu bar app',
    'Apple Silicon',
  ],
  category: 'Developer Tools',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icon-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '512x512' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Fleeble',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fleeble — Smart Notifications for AI Coding Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: '#0f0d1a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Fleeble',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'macOS',
              processorRequirements: 'Apple Silicon',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              description: DESCRIPTION,
              url: SITE_URL,
              downloadUrl: 'https://github.com/STRJack/fleeble/releases/latest',
              softwareVersion: '1.0.0',
              author: {
                '@type': 'Person',
                name: 'STRJack',
                url: 'https://github.com/STRJack',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
