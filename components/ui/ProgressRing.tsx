'use client';

import { useId, useRef } from 'react';
import { animate, onScroll, svg } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import Counter from './Counter';

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  gradient?: [string, string];
  delay?: number;
}

/**
 * Animated SVG progress circle.
 *
 * Uses anime.js `createDrawable`, which drives the stroke dash geometry
 * directly — so the arc draws itself along the path rather than being faked
 * with a dashoffset tween that has to be recomputed whenever the size changes.
 */
export default function ProgressRing({
  value,
  size = 132,
  stroke = 8,
  label,
  gradient = ['#FF5A1F', '#FFB020'],
  delay = 0,
}: ProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();
  const gradientId = useId().replace(/:/g, '');

  const r = (size - stroke) / 2;

  useIsomorphicLayoutEffect(() => {
    const arc = arcRef.current;
    if (!arc) return;

    const [drawable] = svg.createDrawable(arc);

    if (reduced) {
      animate(drawable, { draw: `0 ${value / 100}`, duration: 0 });
      return;
    }

    const anim = animate(drawable, {
      draw: ['0 0', `0 ${value / 100}`],
      duration: 1800,
      delay,
      ease: EASE,
      autoplay: onScroll({ target: ref.current!, enter: 'bottom-=60 top', repeat: false }),
    });

    return () => {
      anim.revert();
    };
  }, [value, delay, reduced]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg ref={ref} width={size} height={size} className="-rotate-90 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          <circle
            ref={arcRef}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,90,31,0.55))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-2xl font-semibold">
            <Counter to={value} suffix="%" duration={1800} />
          </span>
        </div>
      </div>
      {label && (
        <span className="text-center text-xs uppercase tracking-[0.18em] text-ash/45">
          {label}
        </span>
      )}
    </div>
  );
}
