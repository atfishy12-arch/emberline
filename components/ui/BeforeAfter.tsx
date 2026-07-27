'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface BeforeAfterProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  initial?: number;
  className?: string;
}

/**
 * Before/after comparison slider.
 *
 * Position is stored as a percentage and published as a CSS variable, which
 * both the seam and the knob read — so a resize can never desynchronise them,
 * and the drag itself never touches React's render path (the state mirror
 * exists only to keep `aria-valuenow` truthful).
 *
 * Deliberately not built on anime.js `Draggable`: release inertia is wrong
 * for a comparison control (you want it to stay exactly where you put it),
 * and pointer capture gives correct behaviour when the pointer leaves the
 * element mid-drag, which is the case that usually breaks these sliders.
 */
export default function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initial = 52,
  className = '',
}: BeforeAfterProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(initial);
  const pctRef = useRef(initial);
  const dragging = useRef(false);

  const publish = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    pctRef.current = clamped;
    wrapRef.current?.style.setProperty('--pos', `${clamped}%`);
    setPct(clamped);
  }, []);

  const fromClientX = useCallback(
    (clientX: number) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      publish(((clientX - r.left) / r.width) * 100);
    },
    [publish]
  );

  useEffect(() => {
    publish(initial);
  }, [initial, publish]);

  /* Pointer capture keeps the drag alive when the pointer exits the frame. */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    fromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) fromClientX(e.clientX);
  };

  const endDrag = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : 4;
    publish(pctRef.current + (e.key === 'ArrowLeft' ? -step : step));
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`glass relative aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-[28px] ${className}`}
      style={{ ['--pos' as string]: `${initial}%` }}
    >
      {/* AFTER sits underneath, full bleed */}
      <div className="absolute inset-0">{after}</div>

      {/* BEFORE is clipped to the handle position */}
      <div className="absolute inset-0" style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}>
        {before}
      </div>

      <span className="glass-soft pointer-events-none absolute left-4 top-4 z-30 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ash/70">
        {beforeLabel}
      </span>
      <span className="glass-soft pointer-events-none absolute right-4 top-4 z-30 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber">
        {afterLabel}
      </span>

      {/* seam */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-20 w-px -translate-x-1/2 bg-ash/70 shadow-[0_0_24px_4px_rgba(255,176,32,0.55)]"
        style={{ left: 'var(--pos)' }}
      />

      {/* knob — reads the same variable as the seam, so they cannot drift */}
      <button
        type="button"
        role="slider"
        aria-label="Compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-orientation="horizontal"
        onKeyDown={onKey}
        data-cursor="drag"
        style={{ left: 'var(--pos)' }}
        className="absolute top-1/2 z-30 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full border border-ash/25 bg-ash/10 backdrop-blur-md transition-[background-color,transform] duration-300 hover:scale-110 hover:bg-ash/20 focus-visible:bg-ash/20 active:cursor-grabbing"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 6 4 12l5 6M15 6l5 6-5 6"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
