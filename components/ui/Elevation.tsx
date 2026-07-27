'use client';

import { useRef } from 'react';
import { animate, onScroll, stagger, svg } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

type Variant = 'ridge' | 'kiln' | 'foundry' | 'hearth' | 'ashgrove';

/**
 * Line-drawn architectural elevations, one per house type.
 *
 * Drawn rather than photographed: an architect's elevation is the right
 * register for a pre-completion release, it stays crisp at any size, weighs
 * nothing, and — unlike a render — it can draw itself as you arrive.
 */
const SHAPES: Record<Variant, { d: string; fills: string[]; windows: string[] }> = {
  ridge: {
    d: 'M10 150 L10 78 L60 40 L110 78 L110 150 M110 110 L166 110 L166 150 M60 40 L60 22',
    fills: ['M10 78 L60 40 L110 78 L110 150 L10 150 Z', 'M110 110 L166 110 L166 150 L110 150 Z'],
    windows: ['M28 96 h28 v26 h-28 Z', 'M70 96 h24 v26 h-24 Z', 'M124 122 h28 v20 h-28 Z'],
  },
  kiln: {
    d: 'M14 150 L14 60 L86 60 L86 150 M86 92 L150 92 L150 150 M40 60 L40 26 L58 26 L58 60',
    fills: ['M14 60 L86 60 L86 150 L14 150 Z', 'M86 92 L150 92 L150 150 L86 150 Z'],
    windows: ['M28 78 h20 v34 h-20 Z', 'M58 78 h18 v34 h-18 Z', 'M100 106 h36 v26 h-36 Z'],
  },
  foundry: {
    d: 'M12 150 L12 84 L52 52 L92 84 L92 150 M92 84 L132 52 L172 84 L172 150 M92 150 L92 84',
    fills: ['M12 84 L52 52 L92 84 L92 150 L12 150 Z', 'M92 84 L132 52 L172 84 L172 150 L92 150 Z'],
    windows: ['M30 100 h24 v30 h-24 Z', 'M110 100 h24 v30 h-24 Z'],
  },
  hearth: {
    d: 'M16 150 L16 70 L96 70 L96 150 M40 70 L40 34 L72 34 L72 70 M96 108 L154 108 L154 150',
    fills: ['M16 70 L96 70 L96 150 L16 150 Z', 'M96 108 L154 108 L154 150 L96 150 Z'],
    windows: ['M32 88 h22 v30 h-22 Z', 'M62 88 h22 v30 h-22 Z', 'M110 122 h30 v20 h-30 Z'],
  },
  ashgrove: {
    d: 'M10 150 L10 96 L58 96 L58 62 L118 62 L118 150 M118 96 L168 96 L168 150',
    fills: ['M10 96 L58 96 L58 62 L118 62 L118 150 L10 150 Z', 'M118 96 L168 96 L168 150 L118 150 Z'],
    windows: ['M24 112 h22 v26 h-22 Z', 'M72 80 h34 v28 h-34 Z', 'M130 112 h26 v26 h-26 Z'],
  },
};

export default function Elevation({
  variant,
  className = '',
}: {
  variant: Variant;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const shape = SHAPES[variant];

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const outline = svg.createDrawable(el.querySelectorAll('.elev-line'));

    if (reduced) {
      animate(outline, { draw: '0 1', duration: 0 });
      animate(el.querySelectorAll('.elev-win'), { opacity: 1, duration: 0 });
      return;
    }

    const trigger = () => onScroll({ target: el, enter: 'end-=12% start', repeat: false });

    const draw = animate(outline, {
      draw: ['0 0', '0 1'],
      duration: 1700,
      delay: stagger(140),
      ease: EASE,
      autoplay: trigger(),
    });

    // Windows light up after the structure exists — the building is "finished"
    // and then occupied, which is the story the whole page is telling.
    const lights = animate(el.querySelectorAll('.elev-win'), {
      opacity: [0, 1],
      scale: [0.7, 1],
      duration: 700,
      delay: stagger(120, { start: 1100 }),
      ease: EASE,
      autoplay: trigger(),
    });

    return () => {
      draw.revert();
      lights.revert();
    };
  }, [variant, reduced]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 184 164"
      className={`h-full w-full overflow-visible ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`elev-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB020" />
          <stop offset="55%" stopColor="#FF5A1F" />
          <stop offset="100%" stopColor="#FF2D46" />
        </linearGradient>
      </defs>

      {/* massing fill, sitting behind the line work */}
      {shape.fills.map((d, i) => (
        <path key={i} d={d} fill="rgba(255,241,228,0.035)" />
      ))}

      {/* ground line */}
      <path
        className="elev-line"
        d="M0 150 L184 150"
        stroke="rgba(255,241,228,0.22)"
        strokeWidth="1"
        fill="none"
      />

      {/* structure */}
      <path
        className="elev-line"
        d={shape.d}
        stroke={`url(#elev-${variant})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,31,0.45))' }}
      />

      {/* lit glazing */}
      {shape.windows.map((d, i) => (
        <path
          key={i}
          className="elev-win"
          d={d}
          fill="#FFC46A"
          opacity={0}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,176,32,0.75))' }}
        />
      ))}
    </svg>
  );
}
