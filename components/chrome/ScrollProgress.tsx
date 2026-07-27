'use client';

import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from '@/lib/hooks';
import { clamp, damp } from '@/lib/motion';

/**
 * Gradient progress bar pinned to the top edge.
 *
 * Reads scroll position once per frame and damps toward it, so the bar can't
 * jitter on high-resolution trackpads and never forces a synchronous layout
 * from a scroll handler.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    let current = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const goal = max > 0 ? clamp(window.scrollY / max) : 0;

      current += (goal - current) * damp(16, dt);
      el.style.transform = `scaleX(${current})`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left scale-x-0 bg-gradient-to-r from-amber via-ember to-flame shadow-[0_0_18px_2px_rgba(255,176,32,0.55)]"
    />
  );
}
