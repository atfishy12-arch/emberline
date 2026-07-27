'use client';

import { type ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Lenis smooth scrolling.
 *
 * Lenis performs real scrolling (it doesn't fake it with a transform), so
 * anime.js `ScrollObserver`s, IntersectionObservers and `position: sticky`
 * all keep working untouched — that's why this needs no bridge code.
 *
 * It also owns anchor navigation and the `app:scroll-to` event that the
 * navbar and back-to-top button dispatch.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis: Lenis | null = null;
    let raf = 0;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
        lerp: 0.09,
      });

      const loop = (time: number) => {
        lenis!.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      window.__lenis = lenis;
    }

    const scrollTo = (target: Element | 0) => {
      if (lenis) {
        lenis.scrollTo(target === 0 ? 0 : (target as HTMLElement), {
          offset: target === 0 ? 0 : -8,
          duration: 1.4,
        });
      } else if (target === 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const onAnchorClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      scrollTo(el);
      history.replaceState(null, '', hash);
    };

    const onScrollToEvent = (e: Event) => {
      const detail = (e as CustomEvent<string | 0>).detail;
      if (detail === 0 || detail === undefined) return scrollTo(0);
      const el = document.querySelector(detail);
      if (el) scrollTo(el);
    };

    document.addEventListener('click', onAnchorClick);
    window.addEventListener('app:scroll-to', onScrollToEvent);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      window.removeEventListener('app:scroll-to', onScrollToEvent);
      cancelAnimationFrame(raf);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
