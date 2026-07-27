'use client';

import { useRef, useState } from 'react';
import { animate, onScroll, stagger, svg, utils } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import SectionHeading from '../ui/SectionHeading';
import BeforeAfter from '../ui/BeforeAfter';
import Elevation from '../ui/Elevation';
import Reveal from '../ui/Reveal';

/* ------------------------------------------------------------------ */
/*  Floor plans — redrawn whenever the level changes                   */
/* ------------------------------------------------------------------ */
const PLANS = {
  ground: {
    label: 'Ground',
    area: '1,240 sq ft',
    walls:
      'M20 20 H300 V180 H20 Z M20 112 H150 M150 20 V180 M150 112 H300 M232 112 V180',
    rooms: [
      { x: 85, y: 66, name: 'Living', size: '6.8 × 5.2' },
      { x: 225, y: 66, name: 'Kitchen / Dining', size: '7.4 × 5.2' },
      { x: 85, y: 146, name: 'Snug', size: '4.2 × 3.8' },
      { x: 191, y: 146, name: 'Utility', size: '2.6 × 3.0' },
      { x: 266, y: 146, name: 'Store', size: '2.4 × 3.0' },
    ],
    door: 'M150 150 a 30 30 0 0 0 30 -30',
  },
  first: {
    label: 'First',
    area: '1,170 sq ft',
    walls:
      'M20 20 H300 V180 H20 Z M20 100 H120 M120 20 V180 M120 100 H210 M210 20 V180 M210 100 H300',
    rooms: [
      { x: 70, y: 58, name: 'Principal', size: '5.4 × 4.6' },
      { x: 165, y: 58, name: 'Bed 2', size: '4.2 × 4.6' },
      { x: 255, y: 58, name: 'Bed 3', size: '4.0 × 4.6' },
      { x: 70, y: 142, name: 'Ensuite', size: '2.8 × 2.4' },
      { x: 165, y: 142, name: 'Bath', size: '3.0 × 2.4' },
      { x: 255, y: 142, name: 'Landing', size: '—' },
    ],
    door: 'M120 130 a 28 28 0 0 1 28 28',
  },
  site: {
    label: 'Site',
    area: '4.6 acres',
    walls:
      'M14 168 C 70 150, 120 176, 180 158 S 280 140, 306 152 M14 20 H306 V180 H14 Z M60 60 h48 v34 h-48 Z M140 48 h54 v38 h-54 Z M228 66 h52 v32 h-52 Z M84 112 h44 v30 h-44 Z M186 108 h56 v34 h-56 Z',
    rooms: [
      { x: 84, y: 80, name: 'Plots 01–06', size: 'The Ridge' },
      { x: 167, y: 70, name: 'Plots 07–12', size: 'The Kiln' },
      { x: 254, y: 85, name: 'Plots 13–17', size: 'The Foundry' },
      { x: 106, y: 130, name: '18–21', size: 'The Hearth' },
      { x: 214, y: 128, name: '22–24', size: 'Ashgrove' },
    ],
    door: '',
  },
} as const;

type Level = keyof typeof PLANS;

function FloorPlan({ level }: { level: Level }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const plan = PLANS[level];

  /* Re-keyed on `level`, so switching tabs re-runs the draw from zero — the
     plan redraws itself rather than cross-fading, which is what makes the
     control feel like a drawing tool instead of a slideshow. */
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const lines = svg.createDrawable(el.querySelectorAll('.plan-line'));

    if (reduced) {
      animate(lines, { draw: '0 1', duration: 0 });
      utils.set(el.querySelectorAll('.plan-label'), { opacity: 1 });
      return;
    }

    const walls = animate(lines, {
      draw: ['0 0', '0 1'],
      duration: 1500,
      delay: stagger(90),
      ease: EASE,
    });

    const labels = animate(el.querySelectorAll('.plan-label'), {
      opacity: [0, 1],
      y: [8, 0],
      duration: 620,
      delay: stagger(70, { start: 700 }),
      ease: EASE,
    });

    return () => {
      walls.revert();
      labels.revert();
    };
  }, [level, reduced]);

  return (
    <svg ref={ref} viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="plan-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB020" />
          <stop offset="100%" stopColor="#FF5A1F" />
        </linearGradient>
      </defs>

      <path
        className="plan-line"
        d={plan.walls}
        stroke="url(#plan-grad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,31,0.4))' }}
      />
      {plan.door && (
        <path
          className="plan-line"
          d={plan.door}
          stroke="rgba(255,241,228,0.3)"
          strokeWidth="1"
          fill="none"
        />
      )}

      {plan.rooms.map((r) => (
        <g key={r.name} className="plan-label" opacity={0}>
          <text
            x={r.x}
            y={r.y}
            textAnchor="middle"
            className="fill-ash/85 font-sans"
            style={{ fontSize: 8.5, fontWeight: 500 }}
          >
            {r.name}
          </text>
          <text
            x={r.x}
            y={r.y + 11}
            textAnchor="middle"
            className="fill-ash/40 font-mono"
            style={{ fontSize: 7 }}
          >
            {r.size}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Before / after panels                                             */
/* ------------------------------------------------------------------ */
function SitePanel() {
  return (
    <div className="relative h-full w-full bg-[#0d0a08]">
      <div className="absolute inset-0 grid-lines opacity-20" />
      <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d="M0 190 C 70 170, 130 200, 200 182 S 330 158, 400 172 L400 250 L0 250 Z"
          fill="rgba(255,241,228,0.05)"
        />
        <path
          d="M0 190 C 70 170, 130 200, 200 182 S 330 158, 400 172"
          stroke="rgba(255,241,228,0.28)"
          strokeWidth="1.2"
          fill="none"
        />
        {[60, 130, 300, 355].map((x, i) => (
          <path
            key={i}
            d={`M${x} 186 l0 -22 M${x} 172 l-7 -8 M${x} 172 l7 -8`}
            stroke="rgba(255,241,228,0.22)"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <p className="font-mono text-[11px] text-faint">Ridge Farm — acquired March 2024</p>
        <p className="mt-2 max-w-[30ch] text-lg font-semibold tracking-tight text-ash/70">
          Four and a half acres of grazing land.
        </p>
      </div>
    </div>
  );
}

function BuiltPanel() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 120%, rgba(255,90,31,0.34), transparent 62%), radial-gradient(60% 50% at 20% 10%, rgba(255,45,70,0.16), transparent 60%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-[22%] top-[14%] px-[12%]">
        <Elevation variant="ridge" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <p className="font-mono text-[11px] text-amber">The Ridge — completing Spring 2027</p>
        <p className="mt-2 max-w-[30ch] text-lg font-semibold tracking-tight sm:text-xl">
          Six houses, set back into the slope.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Showcase() {
  const [level, setLevel] = useState<Level>('ground');
  const reduced = useReducedMotion();
  const statRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = statRef.current;
    if (!el || reduced) return;
    const anim = animate(el.querySelectorAll('.plan-stat'), {
      opacity: [0, 1],
      y: [18, 0],
      duration: 700,
      delay: stagger(80),
      ease: EASE,
      autoplay: onScroll({ target: el, enter: 'bottom-=60 top', repeat: false }),
    });
    return () => {
      anim.revert();
    };
  }, [reduced]);

  return (
    <section id="showcase" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <SectionHeading
          eyebrow="The site"
          title="Grazing land"
          accent="to front door."
          copy="Drag the seam to see the ridge as we bought it and as it will stand. Then walk the plans."
        />

        <Reveal from="scale" delay={120} duration={1200} className="mt-16 sm:mt-20">
          <BeforeAfter
            before={<SitePanel />}
            after={<BuiltPanel />}
            beforeLabel="March 2024"
            afterLabel="Spring 2027"
          />
        </Reveal>

        {/* ---------- interactive plans ---------- */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal from="left" delay={80}>
            <div className="flex h-full flex-col gap-3">
              {(Object.keys(PLANS) as Level[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLevel(key)}
                  data-cursor="action"
                  aria-pressed={level === key}
                  className={`group relative overflow-hidden rounded-2xl px-6 py-5 text-left transition-all duration-500 ${
                    level === key ? 'glass gradient-border' : 'glass-soft hover:bg-ash/[0.06]'
                  }`}
                >
                  <span className="flex items-center justify-between gap-4">
                    <span
                      className={`text-[15px] font-semibold tracking-tight transition-colors ${
                        level === key ? 'text-ash' : 'text-dim'
                      }`}
                    >
                      {PLANS[key].label}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                        level === key
                          ? 'bg-ember shadow-[0_0_12px_3px_rgba(255,90,31,0.9)]'
                          : 'bg-ash/20'
                      }`}
                    />
                  </span>
                  <span
                    className={`mt-1.5 block font-mono text-[12px] transition-colors ${
                      level === key ? 'text-amber' : 'text-faint'
                    }`}
                  >
                    {PLANS[key].area}
                  </span>
                </button>
              ))}

              <div ref={statRef} className="glass mt-2 rounded-2xl p-6">
                {[
                  ['Ceiling height', '2.7 m'],
                  ['Plot width', '18 m'],
                  ['Parking', '2 + EV'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="plan-stat flex items-baseline justify-between border-b border-ash/8 py-2.5 last:border-0 last:pb-0 first:pt-0"
                    style={{ opacity: 0 }}
                  >
                    <span className="text-[13px] text-faint">{k}</span>
                    <span className="font-mono text-[13px] text-ash/85">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal from="right" delay={140}>
            <div className="glass flex h-full flex-col rounded-3xl p-7 sm:p-9">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {PLANS[level].label} floor
                </h3>
                <span className="font-mono text-[12px] text-amber">The Ridge — Plot 03</span>
              </div>
              <div className="mt-6 flex-1">
                <FloorPlan level={level} />
              </div>
              <p className="mt-5 text-[13px] text-faint">
                Indicative only. Dimensions in metres, taken to internal finish.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
