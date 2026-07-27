import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Canonical origin, resolved per host so the social card keeps working
 * wherever this is deployed:
 *   1. NEXT_PUBLIC_SITE_URL — set it once for a custom domain.
 *   2. Vercel's production URL, injected at build time.
 *   3. The GitHub Pages fallback.
 */
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/`
    : 'https://atfishy12-arch.github.io/emberline/');

/**
 * Next applies `basePath` to routes and to <Image>, but NOT to the URLs in
 * `metadata.icons` — those are emitted verbatim, so on a project page served
 * from /emberline/ every icon would 404. Prefix them by hand.
 */
const BASE = process.env.EXPORT_MODE === 'github' ? '/emberline' : '';

export const metadata: Metadata = {
  // Absolute URLs are required by social crawlers; this resolves the relative
  // paths below against the deployed origin.
  metadataBase: new URL(SITE),
  title: 'Emberline — Architectural homes, built to hold the light',
  description:
    'Twenty-four architect-led houses on the western ridge at Combe St Mary. Board-marked concrete, burnt larch and floor-to-ceiling glass. Phase Two now released, from £845,000.',
  applicationName: 'Emberline',
  keywords: [
    'architectural homes',
    'new build houses',
    'passive house',
    'EPC A homes',
    'Combe St Mary',
    'self build',
  ],
  icons: {
    icon: [
      { url: `${BASE}/icon.svg`, type: 'image/svg+xml' },
      { url: `${BASE}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${BASE}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
    apple: `${BASE}/apple-icon.png`,
    shortcut: `${BASE}/favicon.ico`,
  },
  openGraph: {
    type: 'website',
    siteName: 'Emberline',
    url: SITE,
    title: 'Emberline — Homes that hold the light',
    description:
      'Twenty-four architect-led houses on the western ridge. Phase Two now released, from £845,000.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Emberline — Homes that hold the light. Twenty-four architect-led houses on the western ridge.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emberline — Homes that hold the light',
    description: 'Twenty-four architect-led houses on the western ridge. From £845,000.',
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0705',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="is-loading">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Scroll reveals start at opacity 0 inline and are resolved by JS.
            Without this, a no-JS visitor gets a blank page. */}
        <noscript>
          <style>{`
            [style*="opacity:0"], [style*="opacity: 0"] { opacity: 1 !important; }
            [style*="scaleX(0)"], [style*="scaleY(0)"] { transform: none !important; }
            .is-loading body { overflow: auto !important; height: auto !important; }
            .preloader-root { display: none !important; }
          `}</style>
        </noscript>
      </head>
      <body>
        {/* Keyboard users land here first: the page opens with a preloader and
            a fixed nav, so without this the first Tab is lost inside chrome. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-ash focus:px-5 focus:py-3 focus:text-[14px] focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
