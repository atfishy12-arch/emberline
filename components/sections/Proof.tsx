'use client';

import { useRef } from 'react';
import { animate, onScroll, stagger, utils } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import Marquee from '../ui/Marquee';
import ScrambleText from '../ui/ScrambleText';

const PRESS = [
  'RIBA South West',
  'Dezeen',
  'The Sunday Times',
  'Grand Designs',
  'Architects’ Journal',
  'Homes & Property',
  'Build It Awards',
  'Country Life',
];

const CREDENTIALS = [
  { value: 'RIBA', label: 'Award, Small Housing 2025' },
  { value: 'A', label: 'EPC on every completed home' },
  { value: '11/11', label: 'Delivered on programme' },
  { value: '4.9', label: 'Average resident rating' },
];

/**
 * Credibility strip.
 *
 * Sits immediately under the fold because that is where the doubt is: the
 * hero has made a claim and this answers "says who?" before the visitor has
 * to ask. Deliberately quiet — thin rule, small type, no glass card — so it
 * reads as fact rather than as another marketing panel.
 */
export default function Proof() {
  const rowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    if (reduced) {
      utils.set(row.querySelectorAll('.cred'), { opacity: 1, y: 0 });
      return;
    }

    const anim = animate(row.querySelectorAll('.cred'), {
      opacity: [0, 1],
      y: [26, 0],
      filter: ['blur(8px)', 'blur(0px)'],
      duration: 900,
      delay: stagger(110),
      ease: EASE,
      autoplay: onScroll({ target: row, enter: 'bottom-=60 top', repeat: false }),
    });

    return () => {
      anim.revert();
    };
  }, [reduced]);

  return (
    <section id="proof" aria-label="Credentials and press" className="relative py-16 sm:py-20">
      <div className="rule mb-14" />

      <div className="container">
        <div ref={rowRef} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {CREDENTIALS.map((c) => (
            <div key={c.label} className="cred" style={{ opacity: 0 }}>
              <p className="font-display text-4xl italic leading-none text-amber sm:text-[42px]">
                {c.value}
              </p>
              <p className="mt-3 max-w-[24ch] text-[13px] leading-relaxed text-faint">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* press marquee — one continuous line, no logos we do not have */}
      <div className="mt-14">
        <p className="container mb-5 text-[10px] uppercase tracking-[0.28em] text-faint">
          <ScrambleText text="As featured in" />
        </p>
        <Marquee speed={48}>
          {PRESS.map((name) => (
            <span
              key={name}
              className="flex shrink-0 items-center gap-6 whitespace-nowrap text-[19px] font-medium tracking-tight text-ash/45 transition-colors duration-500 hover:text-ash sm:text-[22px]"
            >
              {name}
              <span aria-hidden className="h-1 w-1 rounded-full bg-ember/60" />
            </span>
          ))}
        </Marquee>
      </div>

      <div className="rule mt-14" />
    </section>
  );
}
