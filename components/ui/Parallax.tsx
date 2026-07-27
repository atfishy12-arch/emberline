'use client';

import { type ReactNode, useRef } from 'react';
import { animate, onScroll } from 'animejs';
import { LINEAR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

interface ParallaxProps {
  children: ReactNode;
  /** Positive drifts down (slower than scroll), negative drifts up. */
  distance?: number;
  scale?: [number, number];
  opacity?: [number, number];
  rotate?: [number, number];
  className?: string;
  /** Smoothing applied to the scrubbed value; 0 = locked to scroll. */
  smooth?: number;
}

/**
 * Scroll-scrubbed transform.
 *
 * `sync` ties the animation's playhead to scroll position across the
 * element's full pass through the viewport. A small smoothing value keeps
 * fast wheel input from feeling brittle without introducing visible lag.
 */
export default function Parallax({
  children,
  distance = 90,
  scale,
  opacity,
  rotate,
  className = '',
  smooth = 0.25,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const anim = animate(el, {
      y: [-distance / 2, distance / 2],
      ...(scale ? { scale } : {}),
      ...(opacity ? { opacity } : {}),
      ...(rotate ? { rotate } : {}),
      ease: LINEAR,
      autoplay: onScroll({
        target: el,
        enter: 'bottom top',
        leave: 'top bottom',
        sync: smooth === 0 ? true : smooth,
      }),
    });

    return () => {
      anim.revert();
    };
  }, [distance, scale, opacity, rotate, smooth, reduced]);

  return (
    <div ref={ref} className={`gpu ${className}`}>
      {children}
    </div>
  );
}
