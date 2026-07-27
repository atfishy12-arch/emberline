'use client';

import { type ReactNode, useRef } from 'react';
import { createAnimatable, spring, type AnimatableObject } from 'animejs';
import { SPRING } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useIsTouch, useReducedMotion } from '@/lib/hooks';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  max?: number;
  lift?: number;
  spotlight?: boolean;
  glare?: boolean;
  cursor?: string;
}

/**
 * 3D tilt with a cursor-tracked spotlight and a directional glare sweep.
 *
 * The pointer position is written straight to CSS custom properties for the
 * lighting (no React state, no re-render) while rotation goes through an
 * anime.js spring — so the card settles with weight instead of snapping back.
 */
export default function TiltCard({
  children,
  className = '',
  max = 9,
  lift = 26,
  spotlight = true,
  glare = true,
  cursor = 'view',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rig = useRef<AnimatableObject | null>(null);

  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const disabled = touch || reduced;

  useIsomorphicLayoutEffect(() => {
    if (disabled || !innerRef.current) return;
    rig.current = createAnimatable(innerRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      ease: spring(SPRING.tilt),
    });
    return () => {
      rig.current?.revert();
      rig.current = null;
    };
  }, [disabled]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width; // 0..1
    const ny = (e.clientY - r.top) / r.height;

    // Lighting is pure CSS — cheap enough to run on every move.
    el.style.setProperty('--cx', `${nx * 100}%`);
    el.style.setProperty('--cy', `${ny * 100}%`);
    el.style.setProperty('--glare-angle', `${150 + nx * 60}deg`);

    if (disabled || !rig.current) return;
    rig.current.rotateX((0.5 - ny) * max * 2);
    rig.current.rotateY((nx - 0.5) * max * 2);
    rig.current.translateZ(lift);
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) {
      el.style.setProperty('--cx', '50%');
      el.style.setProperty('--cy', '50%');
    }
    if (!rig.current) return;
    rig.current.rotateX(0);
    rig.current.rotateY(0);
    rig.current.translateZ(0);
  };

  return (
    <div
      ref={ref}
      data-cursor={cursor}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative rounded-3xl [perspective:1200px] ${className}`}
      style={{ ['--cx' as string]: '50%', ['--cy' as string]: '50%' }}
    >
      <div
        ref={innerRef}
        className="gpu relative h-full rounded-[inherit] [transform-style:preserve-3d]"
      >
        {spotlight && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(420px circle at var(--cx) var(--cy), rgba(255,90,31,0.24), rgba(255,176,32,0.10) 38%, transparent 68%)',
            }}
          />
        )}
        {glare && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(var(--glare-angle, 165deg), rgba(255,255,255,0.18), transparent 55%)',
            }}
          />
        )}
        <div className="relative z-20 h-full rounded-[inherit]">{children}</div>
      </div>
    </div>
  );
}
