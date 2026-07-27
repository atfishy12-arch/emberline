'use client';

import { useEffect, useRef, useState } from 'react';
import { useInViewport, useReducedMotion } from '@/lib/hooks';
import SplitFlap from '../ui/SplitFlap';
import Reveal from '../ui/Reveal';

/**
 * Release board copy. Two lines each, held to 13 columns so the board never
 * changes size between messages.
 */
const MESSAGES = [
  'PHASE TWO\nNOW RELEASED',
  'NINE HOMES\nREMAINING',
  'FROM £845,000\nFREEHOLD',
  'COMPLETING\nSPRING 2027',
  'VIEWINGS\nTHU TO SAT',
] as const;

const DWELL_MS = 5200;

/**
 * A departure board, used for what a board is actually for: the current state
 * of the release. It earns the mechanic instead of decorating with it — the
 * flap is how the information *changes*, so the motion carries the meaning.
 *
 * The cycle only runs while the section is on screen; an off-screen timer
 * flipping forty cells is pure waste, and it would also be animating during
 * the WebGL hero.
 */
export default function Board() {
  const sectionRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const inView = useInViewport(sectionRef, '80px');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % MESSAGES.length),
      DWELL_MS
    );
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  return (
    <section
      ref={sectionRef}
      id="release"
      aria-label="Current release status"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* pooled light under the board, as if it were lit from the front */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46vmin] w-[86vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,90,31,0.28), rgba(255,45,70,0.10) 50%, transparent 72%)',
        }}
      />

      <div className="container relative">
        <Reveal from="down" duration={700} className="flex justify-center">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 animate-flicker rounded-full bg-ember shadow-[0_0_12px_3px_rgba(255,90,31,0.95)]" />
            Live from the ridge
          </span>
        </Reveal>

        <Reveal from="scale" delay={120} duration={1000} className="mt-10">
          <div className="mx-auto w-fit max-w-full overflow-x-auto">
            <div className="neu rounded-2xl p-4 sm:p-6">
              <SplitFlap text={MESSAGES[index]} columns={13} size="lg" cascade={30} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-8 flex items-center justify-center gap-2.5">
            {MESSAGES.map((m, i) => (
              <button
                key={m}
                type="button"
                aria-label={`Show: ${m.replace('\n', ', ')}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                data-cursor="action"
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  i === index
                    ? 'w-8 bg-ember shadow-[0_0_10px_2px_rgba(255,90,31,0.7)]'
                    : 'w-1.5 bg-ash/25 hover:bg-ash/50'
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
