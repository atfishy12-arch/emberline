/**
 * Generates the brand assets that a static export cannot produce at request
 * time: favicons, the apple touch icon, and the Open Graph card.
 *
 * They are authored as SVG (so the mark stays editable and on-palette) and
 * rasterised with sharp, which Next already depends on. Run:
 *
 *   node scripts/brand-assets.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const EMBER = '#FF5A1F';
const FLAME = '#FF2D46';
const AMBER = '#FFB020';
const INK = '#0A0705';
const ASH = '#FFF1E4';

/* ------------------------------------------------------------------ */
/*  Mark — an ember-lit "E" cut from a rounded plinth                  */
/* ------------------------------------------------------------------ */
const markSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="55%" stop-color="${EMBER}"/>
      <stop offset="100%" stop-color="${FLAME}"/>
    </linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="64" height="64" rx="15" fill="${INK}"/>
  <rect x="1.25" y="1.25" width="61.5" height="61.5" rx="13.75" fill="none" stroke="url(#g)" stroke-width="2.5"/>
  <g filter="url(#glow)">
    <rect x="20" y="17" width="24"   height="5" rx="2.5" fill="url(#g)"/>
    <rect x="20" y="29.5" width="17" height="5" rx="2.5" fill="url(#g)"/>
    <rect x="20" y="42" width="24"   height="5" rx="2.5" fill="url(#g)"/>
  </g>
</svg>`;

/* ------------------------------------------------------------------ */
/*  Open Graph card — 1200x630                                         */
/* ------------------------------------------------------------------ */
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="horizon" cx="50%" cy="118%" r="80%">
      <stop offset="0%" stop-color="${EMBER}" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="${FLAME}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="corner" cx="88%" cy="8%" r="55%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="55%" stop-color="${EMBER}"/>
      <stop offset="100%" stop-color="${FLAME}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="house" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="60%" stop-color="${EMBER}"/>
      <stop offset="100%" stop-color="${FLAME}"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="${INK}"/>
  <rect width="1200" height="630" fill="url(#horizon)"/>
  <rect width="1200" height="630" fill="url(#corner)"/>

  <!-- survey grid -->
  <g stroke="${ASH}" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 76}" y1="0" x2="${i * 76}" y2="630"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 76}" x2="1200" y2="${i * 76}"/>`).join('')}
  </g>

  <!-- elevation, echoing the site's line drawings -->
  <g transform="translate(792 214)" fill="none" stroke="url(#house)" stroke-width="3.5"
     stroke-linecap="round" stroke-linejoin="round" opacity="0.95">
    <path d="M0 250 L0 118 L96 46 L192 118 L192 250"/>
    <path d="M192 176 L300 176 L300 250"/>
    <path d="M96 46 L96 6"/>
    <path d="M-40 250 L340 250" stroke="${ASH}" stroke-opacity="0.25" stroke-width="2"/>
  </g>
  <g fill="${AMBER}" opacity="0.9">
    <rect x="828" y="360" width="46" height="52" rx="3"/>
    <rect x="892" y="360" width="40" height="52" rx="3"/>
    <rect x="1016" y="416" width="52" height="38" rx="3"/>
  </g>

  <!-- wordmark -->
  <text x="88" y="150" font-family="Inter, Segoe UI, sans-serif" font-size="21"
        letter-spacing="7" fill="${ASH}" fill-opacity="0.6">E M B E R L I N E</text>

  <text x="88" y="292" font-family="Inter, Segoe UI, sans-serif" font-size="82"
        font-weight="600" letter-spacing="-3" fill="${ASH}">Homes that hold</text>
  <text x="88" y="382" font-family="Georgia, serif" font-style="italic" font-size="82"
        fill="${EMBER}">the light.</text>

  <rect x="88" y="428" width="330" height="3" rx="1.5" fill="url(#rule)"/>

  <text x="88" y="490" font-family="Inter, Segoe UI, sans-serif" font-size="25"
        fill="${ASH}" fill-opacity="0.62">Twenty-four architect-led houses on the western ridge.</text>
  <text x="88" y="532" font-family="Inter, Segoe UI, sans-serif" font-size="25"
        fill="${ASH}" fill-opacity="0.62">Phase Two now released — from £845,000.</text>
</svg>`;

await mkdir(pub, { recursive: true });

// SVG favicon: sharp on the modern browsers, crisp at every size.
await writeFile(join(pub, 'icon.svg'), markSvg(64).trim());

await sharp(Buffer.from(markSvg(180))).png().toFile(join(pub, 'apple-icon.png'));
await sharp(Buffer.from(markSvg(192))).png().toFile(join(pub, 'icon-192.png'));
await sharp(Buffer.from(markSvg(512))).png().toFile(join(pub, 'icon-512.png'));
// favicon.ico is still what some crawlers and older browsers ask for first.
await sharp(Buffer.from(markSvg(48))).resize(48, 48).toFile(join(pub, 'favicon.ico'));

await sharp(Buffer.from(ogSvg)).png({ quality: 90 }).toFile(join(pub, 'og.png'));

/* The source texture is a 1.2 MB PNG of a smooth gradient — a format that is
   actively bad at exactly this kind of image. A static export has no server
   to optimise it on request, so it is converted here instead. */
const src = join(pub, 'art', 'texture.png');
await sharp(src).resize(1100, 1375, { fit: 'cover' }).webp({ quality: 82 }).toFile(join(pub, 'art', 'texture.webp'));

const { size: before } = await sharp(src).metadata().then(async () => (await import('node:fs/promises')).stat(src));
const { size: after } = await (await import('node:fs/promises')).stat(join(pub, 'art', 'texture.webp'));
console.log(`texture: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB webp`);
console.log('brand assets written to public/');
