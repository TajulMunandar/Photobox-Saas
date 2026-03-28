import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SnapNext - SaaS Photo Booth Indonesia | Solusi Photo Box All-in-One',
  description: 'Platform photo booth profesional dengan pembayaran QRIS, printing instan, pembuatan GIF, dan galeri digital. Sempurna untuk event, pesta, dan aktivasi marketing di Indonesia.',
  keywords: [
    'photo booth',
    'SaaS photo booth',
    'photo box',
    'QRIS payment',
    'silent print',
    'GIF engine',
    'newspaper A4',
    'event photography',
    'photo booth Indonesia',
    'SnapNext',
    'photo booth software',
    'photo booth platform',
    'multi-tenant photo booth',
    'photo booth CMS',
    'photo booth management'
  ],
  authors: [{ name: 'SnapNext Team' }],
  creator: 'SnapNext',
  publisher: 'SnapNext',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://snapnext.id'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SnapNext - SaaS Photo Booth Indonesia',
    description: 'Platform photo booth profesional dengan pembayaran QRIS, printing instan, pembuatan GIF, dan galeri digital.',
    url: 'https://snapnext.id',
    siteName: 'SnapNext',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SnapNext - SaaS Photo Booth Indonesia',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SnapNext - SaaS Photo Booth Indonesia',
    description: 'Platform photo booth profesional dengan pembayaran QRIS, printing instan, pembuatan GIF, dan galeri digital.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="h-full">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#a855f7" />
        <meta name="msapplication-TileColor" content="#a855f7" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="language" content="Indonesian" />
        <meta name="geo.region" content="ID" />
        <meta name="geo.placename" content="Indonesia" />
        <meta name="category" content="Technology" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'SnapNext',
              url: 'https://snapnext.id',
              logo: 'https://snapnext.id/logo.png',
              description: 'Platform photo booth profesional dengan pembayaran QRIS, printing instan, pembuatan GIF, dan galeri digital.',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'ID',
                addressLocality: 'Jakarta',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+62-21-1234-5678',
                contactType: 'customer service',
                availableLanguage: ['Indonesian', 'English'],
              },
              sameAs: [
                'https://facebook.com/snapnext',
                'https://instagram.com/snapnext',
                'https://twitter.com/snapnext',
              ],
            }),
          }}
        />
        
        {/* Structured Data for Software Application */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'SnapNext',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '299000',
                priceCurrency: 'IDR',
                priceValidUntil: '2025-12-31',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
              },
            }),
          }}
        />
      </head>
      <body className="h-full bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
