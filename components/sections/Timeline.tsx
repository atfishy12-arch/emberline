'use client';

import { useRef } from 'react';
import { animate, onScroll, stagger, utils } from 'animejs';
import { EASE, LINEAR, easeOut } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import SectionHeading from '../ui/SectionHeading';

const STAGES = [
  {
    step: '01',
    when: 'Week 0',
    title: 'Walk the plot',
    body: 'We meet you on site, in the mud, and show you exactly where the house sits and what you will see from the kitchen window.',
  },
  {
    step: '02',
    when: 'Week 2',
    title: 'Reserve',
    body: 'A £5,000 reservation fee holds the plot for 28 days and freezes the price. Fully deducted from the purchase, refundable if we fail searches.',
  },
  {
    step: '03',
    when: 'Week 6',
    title: 'Specify',
    body: 'Two half-day sessions with the architect to choose kitchen, joinery, stone and the finish on the larch. Costed the same day.',
  },
  {
    step: '04',
    when: 'Month 4',
    title: 'Exchange',
    body: 'Contracts exchange with a 10% deposit held in a client account. Your build slot is locked into the programme.',
  },
  {
    step: '05',
    when: 'Month 5–20',
    title: 'Build',
    body: 'Fortnightly photographs and a named site manager. You are welcome on site any Friday, hard hat provided.',
  },
  {
    step: '06',
    when: 'Completion',
    title: 'Keys',
    body: 'A two-hour handover walking every system, then a two-year defects line that reaches the people who built it.',
  },
] as const;

/**
 * Scroll-drawn programme.
 *
 * The spine grows with scroll position rather than firing once, so scrolling
 * back retracts it.
 *
 * It is a `scaleY`-ed element, not an SVG: a viewBox stretched to an
 * auto-height container needs a definite parent height to resolve against, and
 * with `overflow: visible` the overflowing geometry lands in the document's
 * scrollable region. A transform can do neither — and it composites.
 */
export default function Timeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const spine = spineRef.current;
    if (!root || !spine) return;

    if (reduced) {
      utils.set(spine, { scaleY: 1 });
      utils.set(root.querySelectorAll('.stage'), { opacity: 1, x: 0, filter: 'none' });
      utils.set(root.querySelectorAll('.stage-node'), { opacity: 1, scale: 1 });
      return;
    }

    const line = animate(spine, {
      scaleY: [0, 1],
      ease: LINEAR,
      autoplay: onScroll({
        target: root,
        enter: 'bottom-=140 top',
        leave: 'top+=140 bottom',
        sync: 0.4,
      }),
    });

    const items = animate(root.querySelectorAll('.stage'), {
      opacity: [0, 1],
      x: [-34, 0],
      filter: ['blur(12px)', 'blur(0px)'],
      duration: 1000,
      delay: stagger(140),
      ease: EASE,
      autoplay: onScroll({ target: root, enter: 'bottom-=160 top', repeat: false }),
    });

    const nodes = animate(root.querySelectorAll('.stage-node'), {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 760,
      delay: stagger(140, { start: 200 }),
      ease: easeOut(3),
      autoplay: onScroll({ target: root, enter: 'bottom-=160 top', repeat: false }),
    });

    return () => {
      line.revert();
      items.revert();
      nodes.revert();
    };
  }, [reduced]);

  return (
    <section id="process" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="From grazing land"
          accent="to your keys."
          align="left"
          copy="Six stages, roughly twenty-two months. You will know the name of everyone involved."
        />

        <div ref={rootRef} className="relative mt-16 sm:mt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-[7px] top-2 w-px bg-ash/10 sm:left-[11px]"
          >
            <div
              ref={spineRef}
              className="h-full w-full origin-top bg-gradient-to-b from-amber via-ember to-flame shadow-[0_0_10px_2px_rgba(255,90,31,0.6)]"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>

          <ol className="space-y-14 sm:space-y-[4.5rem]">
            {STAGES.map((s) => (
              <li key={s.step} className="relative pl-12 sm:pl-20">
                <span
                  className="stage-node absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink ring-1 ring-ash/25 sm:left-1 sm:h-5 sm:w-5"
                  style={{ opacity: 0 }}
                >
                  <span className="h-1.5 w-1.5 animate-flicker rounded-full bg-ember shadow-[0_0_10px_3px_rgba(255,90,31,0.9)]" />
                </span>

                <div className="stage" style={{ opacity: 0 }}>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-mono text-sm text-amber">{s.step}</span>
                    <span className="rounded-full bg-ash/6 px-2.5 py-0.5 font-mono text-[11px] text-faint">
                      {s.when}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-2xl font-semibold tracking-tight sm:text-[30px]">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-dim">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
