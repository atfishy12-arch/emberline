'use client';

import { useRef, useState } from 'react';
import { createTimeline, stagger } from 'animejs';
import { EASE, EASE_IN_OUT, easeOut } from '@/lib/motion';
import { useIsomorphicLayoutEffect } from '@/lib/hooks';

const PHASES = ['Surveying the ridge', 'Setting the plots', 'Lighting the windows', 'Ready'];

/**
 * Premium loading screen.
 *
 * Holds the page still (`html.is-loading`) while a counter eases to 100, then
 * lifts a four-panel curtain in sequence. `app:ready` fires as the curtain
 * starts moving rather than after it finishes, so the hero's entrance
 * overlaps the exit — the two read as one continuous move instead of two
 * animations queued back to back.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handOver = () => {
      document.documentElement.classList.remove('is-loading');
      document.documentElement.dataset.ready = 'true';
      window.dispatchEvent(new Event('app:ready'));
    };

    if (reduced) {
      setProgress(100);
      handOver();
      setGone(true);
      return;
    }

    const counter = { n: 0 };
    const tl = createTimeline({
      defaults: { ease: EASE },
      onComplete: () => setGone(true),
    });

    tl
      // count up
      .add(counter, {
        n: 100,
        duration: 1750,
        ease: easeOut(4),
        onUpdate: () => setProgress(Math.round(counter.n)),
      })
      .add('.pl-rail-fill', { width: ['0%', '100%'], duration: 1750, ease: easeOut(4) }, 0)
      // brand mark leaves first
      .add('.pl-mark', { opacity: 0, y: -28, filter: 'blur(12px)', duration: 560 }, '+=180')
      // curtain lifts, panel by panel
      .add(
        '.pl-panel',
        {
          y: ['0%', '-101%'],
          duration: 1000,
          ease: EASE_IN_OUT,
          delay: stagger(70),
          onBegin: handOver,
        },
        '-=340'
      );

    return () => {
      tl.revert();
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    // Safety net: if anything above throws, never trap the user behind the
    // curtain — release scroll after 4s regardless.
    const t = setTimeout(() => {
      if (document.documentElement.classList.contains('is-loading')) {
        document.documentElement.classList.remove('is-loading');
        document.documentElement.dataset.ready = 'true';
        window.dispatchEvent(new Event('app:ready'));
      }
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="preloader-root fixed inset-0 z-[100] flex items-center justify-center">
      {/* curtain */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pl-panel h-full flex-1 bg-[#05060f]" />
        ))}
      </div>

      {/* bloom behind the mark */}
      <div className="pointer-events-none absolute h-[46vmin] w-[46vmin] animate-blob-morph bg-ember/25 blur-[110px]" />

      <div className="pl-mark relative flex flex-col items-center gap-8">
        <div className="relative grid h-24 w-24 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow [animation-duration:6s]">
            <defs>
              <linearGradient id="pl-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFB020" />
                <stop offset="60%" stopColor="#FF5A1F" />
                <stop offset="100%" stopColor="#FF2D46" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,241,228,0.08)" strokeWidth="1.5" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#pl-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="70 210"
            />
          </svg>
          <span className="font-display text-3xl italic text-ash">E</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="tabular font-mono text-5xl font-medium tracking-tight sm:text-6xl">
            {String(progress).padStart(3, '0')}
          </span>

          <div className="h-px w-56 overflow-hidden bg-ash/15 sm:w-72">
            <div className="pl-rail-fill h-full w-0 bg-gradient-to-r from-amber via-ember to-flame" />
          </div>

          <span className="mt-1 h-4 text-[11px] uppercase tracking-[0.32em] text-faint">
            {PHASES[Math.min(PHASES.length - 1, Math.floor((progress / 100) * PHASES.length))]}
          </span>
        </div>
      </div>
    </div>
  );
}
