'use client';

import { useRef, useState } from 'react';
import { useIsomorphicLayoutEffect, useIsTouch, useReducedMotion } from '@/lib/hooks';
import { damp } from '@/lib/motion';

const TRAIL_COUNT = 5;

type Variant = 'default' | 'action' | 'drag' | 'view' | 'text';

const HALO_SIZE: Record<Variant, number> = {
  default: 38,
  action: 74,
  drag: 92,
  view: 108,
  text: 8,
};

const LABEL: Partial<Record<Variant, string>> = {
  drag: 'Drag',
  view: 'Explore',
};

/**
 * Custom cursor + global pointer broadcast.
 *
 * One pointermove listener feeds everything: a pinned dot, a lagging halo,
 * a short trail of decaying followers, and the `--mx/--my` CSS variables the
 * ember field's survey grid and the section spotlights read.
 *
 * All positions are written inside a single rAF using frame-rate independent
 * damping, never in the event handler — so a 1000 Hz mouse can't queue up a
 * thousand style writes per second.
 *
 * Elements opt into states with `data-cursor="action|drag|view|text"`.
 */
export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const target = useRef({ x: 0, y: 0 });
  const halo = useRef({ x: 0, y: 0 });
  const trail = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
  );
  const visibleRef = useRef(false);

  const [variant, setVariant] = useState<Variant>('default');
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const enabled = !touch && !reduced;

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const start = { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };
    target.current = { ...start };
    halo.current = { ...start };
    trail.current = trail.current.map(() => ({ ...start }));

    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;

      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }

      const el = e.target instanceof Element ? e.target.closest('[data-cursor]') : null;
      const next = (el?.getAttribute('data-cursor') as Variant) || 'default';
      setVariant((v) => (v === next ? v : next));
    };

    const loop = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;

      const t = target.current;

      // halo trails the pointer with a soft settle
      const kHalo = damp(14, dt);
      halo.current.x += (t.x - halo.current.x) * kHalo;
      halo.current.y += (t.y - halo.current.y) * kHalo;

      // each trail node chases the one in front of it, decaying
      let leadX = t.x;
      let leadY = t.y;
      for (let i = 0; i < trail.current.length; i++) {
        const node = trail.current[i];
        const k = damp(22 - i * 3, dt);
        node.x += (leadX - node.x) * k;
        node.y += (leadY - node.y) * k;
        leadX = node.x;
        leadY = node.y;

        const el = trailRefs.current[i];
        if (el) el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) translate(-50%, -50%)`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${halo.current.x}px, ${halo.current.y}px, 0) translate(-50%, -50%)`;
      }

      root.style.setProperty('--mx', `${t.x}px`);
      root.style.setProperty('--my', `${t.y}px`);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('mouseleave', leave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('mouseleave', leave);
      root.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = HALO_SIZE[variant];
  const label = LABEL[variant];

  return (
    <>
      {/* decaying trail */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="pointer-events-none fixed left-0 top-0 z-[93] rounded-full bg-amber"
          style={{
            width: 5 - i * 0.6,
            height: 5 - i * 0.6,
            opacity: visible ? 0.32 * (1 - i / TRAIL_COUNT) : 0,
            filter: 'blur(1px)',
            transform: 'translate3d(-100px,-100px,0)',
            transition: 'opacity 300ms ease',
          }}
        />
      ))}

      {/* halo */}
      <div
        ref={haloRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] grid place-items-center rounded-full border border-ash/25 transition-[width,height,opacity,background-color] duration-300 ease-physics"
        style={{
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          background:
            variant === 'default'
              ? 'radial-gradient(circle, rgba(255,90,31,0.22), transparent 70%)'
              : 'radial-gradient(circle, rgba(255,176,32,0.16), transparent 72%)',
          backdropFilter: variant === 'view' ? 'blur(2px)' : 'none',
          transform: 'translate3d(-100px,-100px,0)',
        }}
      >
        {label && (
          <span className="select-none text-[9px] uppercase tracking-[0.18em] text-ash/80">
            {label}
          </span>
        )}
      </div>

      {/* dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[96] rounded-full bg-ash transition-[width,height,opacity] duration-200"
        style={{
          width: pressed ? 14 : 6,
          height: pressed ? 14 : 6,
          opacity: visible && variant === 'default' ? 1 : 0.3,
          boxShadow: '0 0 14px 3px rgba(255,176,32,0.55)',
          transform: 'translate3d(-100px,-100px,0)',
        }}
      />
    </>
  );
}
