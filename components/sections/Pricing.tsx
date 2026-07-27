'use client';

import { useRef, useState } from 'react';
import { animate } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import Counter from '../ui/Counter';
import MagneticButton from '../ui/MagneticButton';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import TiltCard from '../ui/TiltCard';

const HOMES = [
  {
    id: 'kiln',
    name: 'The Kiln',
    price: 845000,
    monthly: 3180,
    remaining: '4 of 6 remaining',
    tagline: 'Three bedrooms, 1,860 sq ft.',
    includes: [
      'Board-marked concrete plinth',
      'Burnt larch cladding',
      'Air source heating, underfloor',
      'Landscaped plot to boundary',
    ],
    featured: false,
  },
  {
    id: 'ridge',
    name: 'The Ridge',
    price: 1240000,
    monthly: 4670,
    remaining: '2 of 6 remaining',
    tagline: 'Four bedrooms, 2,410 sq ft.',
    includes: [
      'Everything in The Kiln',
      'Double-height west-facing living',
      'Full-width glazed gable',
      'Oak stair, stone hearth',
      'Garage and EV charger',
    ],
    featured: true,
  },
  {
    id: 'ashgrove',
    name: 'Ashgrove',
    price: 0,
    monthly: 0,
    remaining: 'Last three plots',
    tagline: 'Five bedrooms, 3,480 sq ft.',
    includes: [
      'Everything in The Ridge',
      'Ridge-top plot, private woodland',
      'Stepped section over three levels',
      'Detached studio outbuilding',
      'Architect design sessions included',
    ],
    featured: false,
  },
] as const;

export default function Pricing() {
  const [monthly, setMonthly] = useState(false);
  const knobRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const knob = knobRef.current;
    if (!knob) return;
    animate(knob, { x: monthly ? 28 : 0, duration: reduced ? 0 : 520, ease: EASE });
  }, [monthly, reduced]);

  return (
    <section id="availability" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <SectionHeading
          eyebrow="Availability"
          title="Nine homes left"
          accent="in Phase Two."
          copy="Freehold, no ground rent, no service charge. Prices held from the day you reserve."
        />

        {/* ---------- price / monthly toggle ---------- */}
        <Reveal delay={120} className="mt-12 flex justify-center">
          <div className="glass flex items-center gap-4 rounded-full px-5 py-3">
            <span
              className={`text-[13.5px] transition-colors duration-300 ${
                !monthly ? 'text-ash' : 'text-faint'
              }`}
            >
              Purchase price
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={monthly}
              aria-label="Show indicative monthly cost"
              onClick={() => setMonthly((m) => !m)}
              data-cursor="action"
              className="neu relative h-7 w-[60px] shrink-0 rounded-full"
            >
              <span
                ref={knobRef}
                className="absolute left-[3px] top-[3px] block h-[22px] w-[22px] rounded-full bg-gradient-to-br from-amber via-ember to-flame shadow-[0_0_16px_3px_rgba(255,90,31,0.55)]"
              />
            </button>

            <span
              className={`flex items-center gap-2 text-[13.5px] transition-colors duration-300 ${
                monthly ? 'text-ash' : 'text-faint'
              }`}
            >
              Monthly
              <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-medium text-amber">
                indicative
              </span>
            </span>
          </div>
        </Reveal>

        {/* ---------- homes ---------- */}
        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-center">
          {HOMES.map((home, i) => {
            const onApplication = home.price === 0;

            return (
              <Reveal
                key={home.id}
                from="up"
                delay={i * 120}
                className={home.featured ? 'lg:-my-6' : ''}
              >
                <TiltCard className="h-full" max={home.featured ? 7 : 5}>
                  <div
                    className={`relative flex h-full flex-col rounded-3xl p-8 sm:p-9 ${
                      home.featured ? 'glass gradient-border shadow-ember' : 'glass-soft'
                    }`}
                  >
                    {home.featured && (
                      <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-ember to-amber px-3.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink">
                        Most reserved
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-3xl italic leading-none">{home.name}</h3>
                      <span className="mt-1 shrink-0 rounded-full bg-ash/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-faint">
                        {home.remaining}
                      </span>
                    </div>
                    <p className="mt-3 text-[13.5px] text-faint">{home.tagline}</p>

                    <div className="mt-8 flex items-end gap-1.5">
                      {onApplication ? (
                        <span className="text-[28px] font-semibold leading-none tracking-tight">
                          On application
                        </span>
                      ) : (
                        <>
                          <span className="text-[40px] font-semibold leading-none tracking-tight sm:text-[44px]">
                            {/* keyed so the counter replays when the mode flips */}
                            <Counter
                              key={`${home.id}-${monthly}`}
                              to={monthly ? home.monthly : home.price}
                              prefix="£"
                              duration={1000}
                            />
                          </span>
                          <span className="pb-1.5 text-[13px] text-faint">
                            {monthly ? '/ month' : 'freehold'}
                          </span>
                        </>
                      )}
                    </div>
                    {monthly && !onApplication && (
                      <p className="mt-2 text-[12px] text-faint">
                        25 years at 4.6%, 25% deposit. Not advice.
                      </p>
                    )}

                    <ul className="mt-8 flex-1 space-y-3.5">
                      {home.includes.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[14px] text-ash/75">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="mt-0.5 shrink-0 text-amber"
                            aria-hidden
                          >
                            <path
                              d="m4 12.5 5 5L20 6.5"
                              stroke="currentColor"
                              strokeWidth="2.1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <MagneticButton
                      as="a"
                      href="#contact"
                      className={`mt-9 h-12 w-full rounded-full text-[14.5px] font-semibold ${
                        home.featured ? 'bg-ash text-ink' : 'glass-soft hover:bg-ash/10'
                      }`}
                      glowClassName={
                        home.featured
                          ? 'from-amber/50 via-ember/60 to-flame/50'
                          : 'from-ember/40 via-flame/30 to-amber/30'
                      }
                    >
                      Book a viewing
                    </MagneticButton>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <p className="mt-10 text-center text-[13px] text-faint">
            Reservation fee £5,000, deducted from the purchase price and refundable if searches
            fail.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
