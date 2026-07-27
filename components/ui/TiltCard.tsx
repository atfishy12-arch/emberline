'use client';

import { type ReactNode, useRef } from 'react';
import { createAnimatable, spring, type AnimatableObject } from 'animejs';
import { SPRING, easeOut } from '@/lib/motion';
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
    const cfg = spring(SPRING.tilt);
    rig.current = createAnimatable(innerRef.current, {
      rotateX: cfg,
      rotateY: cfg,
      translateZ: cfg,
      // Scale eases rather than springs: a spring here fights the rotation
      // and reads as wobble on a large surface.
      scale: { duration: 220, ease: easeOut(3) },
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

    /* Light-reactive shadow: the card is lit from the cursor, so the shadow
       is cast *away* from it. Offsets are inverted and the spread grows with
       distance from centre, which is what sells the tilt as a real object
       lifting off the page rather than a rotating rectangle. */
    const offX = (0.5 - nx) * 26;
    const offY = (0.5 - ny) * 26;
    el.style.setProperty('--shadow-x', `${offX.toFixed(1)}px`);
    el.style.setProperty('--shadow-y', `${(offY + 18).toFixed(1)}px`);

    if (disabled || !rig.current) return;
    rig.current.rotateX((0.5 - ny) * max * 2);
    rig.current.rotateY((nx - 0.5) * max * 2);
    rig.current.translateZ(lift);
    rig.current.scale(1.018);
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) {
      el.style.setProperty('--cx', '50%');
      el.style.setProperty('--cy', '50%');
      el.style.setProperty('--shadow-x', '0px');
      el.style.setProperty('--shadow-y', '0px');
    }
    if (!rig.current) return;
    // Softer reset than the pursuit: leaving should feel like settling, so
    // rotation, depth and scale all return through the same spring.
    rig.current.rotateX(0);
    rig.current.rotateY(0);
    rig.current.translateZ(0);
    rig.current.scale(1);
  };

  return (
    <div
      ref={ref}
      data-cursor={cursor}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative rounded-3xl [perspective:1000px] ${className}`}
      style={{
        ['--cx' as string]: '50%',
        ['--cy' as string]: '50%',
        ['--shadow-x' as string]: '0px',
        ['--shadow-y' as string]: '0px',
      }}
    >
      <div
        ref={innerRef}
        /* Inline rather than a Tailwind arbitrary value: `shadow-[var(--x)_…]`
           does not compile to a usable --tw-shadow, so the rule silently
           resolves to no shadow at all. */
        style={{
          boxShadow: 'var(--shadow-x) var(--shadow-y) 44px -20px rgba(0,0,0,0.85)',
          transition: 'box-shadow 300ms cubic-bezier(0.16,1,0.3,1)',
        }}
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
