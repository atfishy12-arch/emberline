'use client';

import { useRef } from 'react';
import { animate, onScroll } from 'animejs';
import { LINEAR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import ScrollHighlight from '../ui/ScrollHighlight';
import SplitReveal from '../ui/SplitReveal';

/**
 * Full-bleed breath between chapters.
 *
 * Every other section is a container with a grid in it; this one is a held
 * shot — no card, no columns, one line of type over moving light. It exists
 * to change the pacing, which is what stops a long page feeling like a list
 * of panels.
 */
export default function Statement() {
  const sectionRef = useRef<HTMLElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const ghost = ghostRef.current;
    const glow = glowRef.current;
    if (!section || !ghost || !glow || reduced) return;

    // The oversized ghost word drifts across the full pass — slower than the
    // page, so it reads as being much further away.
    const drift = animate(ghost, {
      x: ['12%', '-12%'],
      ease: LINEAR,
      autoplay: onScroll({
        target: section,
        enter: 'end start',
        leave: 'start end',
        sync: 0.3,
      }),
    });

    // The fire behind swells as the section centres, then falls away.
    const swell = animate(glow, {
      scale: [0.75, 1.35],
      opacity: [0.25, 0.85],
      ease: LINEAR,
      autoplay: onScroll({
        target: section,
        enter: 'end start',
        leave: 'center center',
        sync: 0.35,
      }),
    });

    return () => {
      drift.revert();
      swell.revert();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      aria-label="Statement"
      className="relative flex min-h-[86svh] items-center overflow-hidden py-28"
    >
      {/* ambient pool */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,90,31,0.55), rgba(255,45,70,0.22) 45%, transparent 70%)',
          opacity: 0.25,
        }}
      />

      {/* ghost word */}
      <span
        ref={ghostRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[26vw] font-semibold leading-none tracking-tighter text-ash/[0.045]"
      >
        WESTERN RIDGE
      </span>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 animate-flicker rounded-full bg-flame shadow-[0_0_12px_3px_rgba(255,45,70,0.9)]" />
            Combe St Mary
          </span>

          <h2 className="mt-8 text-display font-semibold">
            <SplitReveal text="Twenty-four" />{' '}
            <SplitReveal
              text="houses."
              delay={120}
              className="gradient-text font-display font-normal italic"
            />
            <br />
            <SplitReveal text="Then we hand back the field." delay={240} />
          </h2>

          <ScrollHighlight
            text="Half of the four and a half acres stays as woodland and meadow, transferred to the residents company on completion. It cannot be built on. That was the condition we bought the land under, and it is the reason the planning went through in nine weeks."
            className="mx-auto mt-10 max-w-[52ch] text-[17px] font-medium leading-[1.55] tracking-tight sm:text-[19px]"
          />
        </div>
      </div>
    </section>
  );
}
