'use client';

import { type ElementType, type ReactNode, useRef } from 'react';
import { animate, onScroll, utils } from 'animejs';
import { EASE, DUR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

const FROM: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 78 },
  down: { y: -78 },
  left: { x: 90 },
  right: { x: -90 },
  scale: { scale: 0.88 },
  none: {},
};

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  from?: Direction;
  delay?: number;
  duration?: number;
  blur?: boolean;
  className?: string;
  /** Fires the reveal this many px before the element's top hits the fold. */
  offset?: number;
}

/**
 * Scroll-triggered entrance.
 *
 * anime.js `onScroll` is used as the `autoplay` source, so the animation is
 * constructed once and the observer decides when it runs — no per-frame work
 * and no React re-render when it fires.
 */
export default function Reveal({
  children,
  as: tag = 'div',
  from = 'up',
  delay = 0,
  duration = DUR.base,
  blur = true,
  className = '',
  offset = 80,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  /* See MagneticButton: TS can't resolve props for an open ElementType union
     at the JSX call site, so the rendered tag is loosened. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = tag as any;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      utils.set(el, { opacity: 1, x: 0, y: 0, scale: 1, filter: 'none' });
      return;
    }

    const offsets = FROM[from];
    const anim = animate(el, {
      opacity: [0, 1],
      ...(offsets.y !== undefined ? { y: [offsets.y, 0] } : {}),
      ...(offsets.x !== undefined ? { x: [offsets.x, 0] } : {}),
      ...(offsets.scale !== undefined ? { scale: [offsets.scale, 1] } : {}),
      ...(blur ? { filter: ['blur(12px)', 'blur(0px)'] } : {}),
      duration,
      delay,
      ease: EASE,
      autoplay: onScroll({
        target: el,
        enter: `bottom-=${offset} top`,
        // Play once; re-entering from below shouldn't replay content the
        // reader has already seen.
        repeat: false,
      }),
    });

    return () => {
      anim.revert();
    };
  }, [from, delay, duration, blur, offset, reduced]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
