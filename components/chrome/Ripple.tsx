'use client';

import { useRef } from 'react';
import { animate } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Global click ripple.
 *
 * Spawns a short-lived expanding ring into a fixed overlay, so it works over
 * any element without per-component markup or `overflow: hidden` gymnastics.
 * The node removes itself on complete — no React state, no re-render.
 */
export default function Ripple() {
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const host = layer.current;
    if (!host || reduced) return;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const ring = document.createElement('span');
      ring.className = 'absolute rounded-full border border-amber/50';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      ring.style.width = '0px';
      ring.style.height = '0px';
      ring.style.transform = 'translate(-50%, -50%)';
      host.appendChild(ring);

      animate(ring, {
        width: [0, 220],
        height: [0, 220],
        opacity: [0.75, 0],
        duration: 820,
        ease: EASE,
        onComplete: () => ring.remove(),
      });
    };

    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      host.replaceChildren();
    };
  }, [reduced]);

  return (
    <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-[94] overflow-hidden" />
  );
}
