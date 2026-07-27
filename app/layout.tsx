import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Emberline — Architectural homes, built to hold the light',
  description:
    'Emberline designs and builds a small number of architect-led homes each year. Concrete, timber and glass, set into the ridge.',
  openGraph: {
    title: 'Emberline — Architectural homes',
    description: 'A small number of architect-led homes each year. Now releasing Phase Two.',
    type: 'website',
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
      <body>{children}</body>
    </html>
  );
}
