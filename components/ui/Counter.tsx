'use client';

import { useRef, useState } from 'react';
import { animate, onScroll } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

interface CounterProps {
  to: number;
  from?: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
}

/**
 * Counts up once on scroll-in.
 *
 * anime.js animates a plain JS object and we mirror the value into state, so
 * the only thing React re-renders is the text node.
 */
export default function Counter({
  to,
  from = 0,
  decimals = 0,
  duration = 2200,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(from);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      setValue(to);
      return;
    }

    const box = { n: from };
    const anim = animate(box, {
      n: to,
      duration,
      ease: EASE,
      onUpdate: () => setValue(box.n),
      autoplay: onScroll({ target: el, enter: 'bottom-=40 top', repeat: false }),
    });

    return () => {
      anim.revert();
    };
  }, [to, from, duration, reduced]);

  const formatted = value
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
