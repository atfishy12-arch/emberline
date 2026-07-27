'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  useRef,
} from 'react';
import { createAnimatable, spring, type AnimatableObject } from 'animejs';
import { SPRING, easeOut } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useIsTouch, useReducedMotion } from '@/lib/hooks';

/** Constant upward offset applied while hovered, in px. */
const LIFT = 3;

type MagneticButtonProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** How far the element travels relative to pointer offset. */
  strength?: number;
  /** Max travel in px, before strength is applied. */
  radius?: number;
  className?: string;
  glowClassName?: string;
  cursor?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

/**
 * Magnetic hover.
 *
 * The element leans toward the cursor and its label leans ~40% further,
 * which gives the button internal parallax and makes it feel like a solid
 * object rather than a moving rectangle.
 *
 * `createAnimatable` is the right primitive here: pointermove just pushes
 * new target values into a spring that's already running, instead of
 * constructing a fresh animation on every event.
 */
export default function MagneticButton<T extends ElementType = 'button'>({
  as,
  children,
  strength = 0.34,
  radius = 90,
  className = '',
  glowClassName = 'from-amber/60 via-ember/50 to-flame/50',
  cursor = 'action',
  ...rest
}: MagneticButtonProps<T>) {
  /* Polymorphic render escape hatch. The public API stays fully typed via the
     generic above; TypeScript just can't resolve props for an open
     `ElementType` union at the JSX call site, so the tag itself is loosened. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = (as || 'button') as any;
  const ref = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const shell = useRef<AnimatableObject | null>(null);
  const label = useRef<AnimatableObject | null>(null);

  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const disabled = touch || reduced;

  useIsomorphicLayoutEffect(() => {
    if (disabled || !ref.current || !labelRef.current) return;

    const cfg = spring(SPRING.magnetic);
    /* Position rides a spring so it settles with weight, but `scale` gets its
       own short ease-out: a spring on scale reads as wobble, and the press
       needs to feel immediate. One animatable owns the whole transform, so
       nothing fights over it. */
    shell.current = createAnimatable(ref.current, {
      x: cfg,
      y: cfg,
      scale: { duration: 190, ease: easeOut(3) },
    });
    label.current = createAnimatable(labelRef.current, { x: cfg, y: cfg });

    return () => {
      shell.current?.revert();
      label.current?.revert();
      shell.current = null;
      label.current = null;
    };
  }, [disabled]);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (disabled || !el || !shell.current || !label.current) return;
    const r = el.getBoundingClientRect();
    const dx = Math.max(-radius, Math.min(radius, e.clientX - (r.left + r.width / 2)));
    const dy = Math.max(-radius, Math.min(radius, e.clientY - (r.top + r.height / 2)));

    shell.current.x(dx * strength);
    // LIFT is a constant upward offset added to the magnetic pull, so the
    // button rises off the page while still leaning toward the cursor.
    shell.current.y(dy * strength - LIFT);
    label.current.x(dx * strength * 0.4);
    label.current.y(dy * strength * 0.4);
  };

  const onEnter = () => {
    if (disabled) return;
    shell.current?.scale(1.035);
  };

  /* Press reads as the button being pushed *into* the page. */
  const onPress = () => {
    if (disabled) return;
    shell.current?.scale(0.97);
  };

  const reset = () => {
    shell.current?.x(0);
    shell.current?.y(0);
    shell.current?.scale(1);
    label.current?.x(0);
    label.current?.y(0);
  };

  return (
    <Tag
      ref={ref}
      data-cursor={cursor}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={reset}
      onPointerDown={onPress}
      onPointerUp={onEnter}
      onBlur={reset}
      /* Only box-shadow transitions in CSS — the transform belongs to anime,
         and a CSS `active:scale` here would silently overwrite it. */
      className={`group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full shadow-[0_2px_10px_-6px_rgba(0,0,0,0.7)] transition-shadow duration-200 ease-out hover:shadow-[0_16px_38px_-12px_rgba(255,90,31,0.6)] ${className}`}
      {...rest}
    >
      {/* travelling sheen on hover */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full">
        <span className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-ash/20 opacity-0 blur-md transition-opacity duration-300 group-hover:animate-shimmer group-hover:opacity-100" />
      </span>

      {/* halo — deepens as well as appears, so the glow reads as intensity
          rather than a light switch */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-6 -z-20 rounded-full bg-gradient-to-r ${glowClassName} opacity-0 blur-2xl transition-all duration-200 ease-out group-hover:-inset-8 group-hover:opacity-100`}
      />

      <span ref={labelRef} className="relative flex items-center gap-2">
        {children}
      </span>
    </Tag>
  );
}
