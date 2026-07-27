'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/** SSR-safe layout effect — React warns if you use the real one on the server. */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** True once the preloader has handed control to the page. */
export function useAppReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.ready === 'true') {
      setReady(true);
      return;
    }
    const onReady = () => setReady(true);
    window.addEventListener('app:ready', onReady);
    return () => window.removeEventListener('app:ready', onReady);
  }, []);

  return ready;
}

/** Live-updating media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);

  return matches;
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsTouch = () => useMediaQuery('(hover: none), (pointer: coarse)');

/**
 * Reports whether an element is on screen. Used to park the WebGL render
 * loop when the hero scrolls away.
 */
export function useInViewport<T extends HTMLElement>(
  ref: RefObject<T | null>,
  rootMargin = '200px'
): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
