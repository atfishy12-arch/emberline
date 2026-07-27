# Emberline

A cinematic single-page site for a fictional architectural housing developer.

**Live:** https://atfishy12-arch.github.io/emberline/

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 3** — the design system lives in `tailwind.config.js` and `app/globals.css`
- **Anime.js 4.5** — every animation: timelines, scroll scrubbing, springs, SVG drawing, text splitting
- **Lenis** — smooth scrolling (real scrolling, so `sticky` and observers still work)
- **React Three Fiber / three.js** — the hero's real-time architectural model

No GSAP and no Framer Motion: Anime.js v4 covers the whole surface this page needs.

## Running it

```bash
npm install
npm run dev      # http://localhost:3210
npm run build
```

## Deploying

The site is fully static. For GitHub Pages:

```bash
EXPORT_MODE=github npm run build
```

That writes `out/`, with `basePath`/`assetPrefix` set to `/emberline` and image
optimisation disabled (a static export has no server to optimise on request).
Drop the `EXPORT_MODE` variable and the same code builds for any Node host with
image optimisation intact.

## Structure

```
app/                 layout, page composition, global tokens
components/
  chrome/            preloader, cursor, navbar, scroll progress, ripple, Lenis
  sections/          the 13 page sections, one file each
  three/             the WebGL architectural scene
  ui/                reusable primitives (Reveal, SplitReveal, TiltCard, …)
lib/                 motion language (easings, springs, damping) + hooks
```

### Notes worth knowing before editing

- **Motion language** is centralised in `lib/motion.ts`. Anime.js 4.5 removed
  the `ease: 'cubicBezier(...)'` *string* form — a string silently falls back to
  the default curve, so always import the easing functions from there.
- **`Scene`** gives a section a scroll-scrubbed exit. Do not wrap sections that
  contain `position: sticky` children: a transformed ancestor becomes their
  containing block and changes where they pin.
- **`overflow-x: clip`** on the root (not `hidden`) — entrance animations park
  elements off-screen right, and `hidden` would establish a scroll container
  that breaks every sticky section.
- **Reduced motion** is a different path, not a disabled one. Every component
  resolves to its end state; nothing is left invisible.

## Content

All copy, pricing, plots and testimonials are fictional. The contact form is a
demo and posts nowhere.
