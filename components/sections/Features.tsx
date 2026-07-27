'use client';

import { useRef } from 'react';
import { animate, onScroll, stagger, svg, utils } from 'animejs';
import { EASE, easeOut } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import SectionHeading from '../ui/SectionHeading';
import TiltCard from '../ui/TiltCard';

/* ------------------------------------------------------------------ */
/*  Section drawing that builds itself                                 */
/* ------------------------------------------------------------------ */
function SectionDrawing() {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const lines = svg.createDrawable(el.querySelectorAll('.draw'));

    if (reduced) {
      animate(lines, { draw: '0 1', duration: 0 });
      utils.set(el.querySelectorAll('.heat'), { opacity: 1 });
      return;
    }

    const trigger = () => onScroll({ target: el, enter: 'end-=10% start', repeat: false });

    const build = animate(lines, {
      draw: ['0 0', '0 1'],
      duration: 1900,
      delay: stagger(180),
      ease: EASE,
      autoplay: trigger(),
    });

    // Warmth rises through the section once the structure is drawn.
    const heat = animate(el.querySelectorAll('.heat'), {
      opacity: [0, 0.9],
      y: [14, 0],
      duration: 900,
      delay: stagger(150, { start: 1200 }),
      ease: easeOut(3),
      autoplay: trigger(),
    });

    return () => {
      build.revert();
      heat.revert();
    };
  }, [reduced]);

  return (
    <svg ref={ref} viewBox="0 0 340 150" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="spec-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFB020" />
          <stop offset="60%" stopColor="#FF5A1F" />
          <stop offset="100%" stopColor="#FF2D46" />
        </linearGradient>
      </defs>

      {/* ground + envelope */}
      <path className="draw" d="M6 140 L334 140" stroke="rgba(255,241,228,0.2)" strokeWidth="1" fill="none" />
      <path
        className="draw"
        d="M40 140 L40 58 L170 12 L300 58 L300 140"
        stroke="url(#spec-line)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ filter: 'drop-shadow(0 0 7px rgba(255,90,31,0.5))' }}
      />
      {/* floor plate */}
      <path className="draw" d="M40 96 L300 96" stroke="rgba(255,241,228,0.28)" strokeWidth="1.2" fill="none" strokeDasharray="4 5" />
      {/* insulation hatching */}
      <path className="draw" d="M52 132 L52 104 M72 132 L72 104 M92 132 L92 104 M112 132 L112 104" stroke="rgba(255,176,32,0.35)" strokeWidth="1" fill="none" />

      {/* rising warmth */}
      {[
        [110, 118],
        [170, 108],
        [230, 118],
      ].map(([x, y], i) => (
        <g key={i} className="heat" opacity={0}>
          <path
            d={`M${x} ${y} c -7 -12, 7 -20, 0 -32`}
            stroke="#FFB020"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const ICONS = {
  fabric: <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />,
  heat: <path d="M12 3c4 5 2 6 0 8s-4 3-1 6c2 2 5 2 6-1" strokeLinecap="round" />,
  glazing: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M12 4v16M4 12h16" strokeLinecap="round" />
    </>
  ),
  warranty: (
    <>
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
} as const;

const SPEC = [
  {
    key: 'fabric',
    title: 'Fabric first',
    body: '340 mm walls, 0.13 U-value, airtightness tested at 1.8 ACH. The house barely needs the heating on.',
    span: '',
  },
  {
    key: 'heat',
    title: 'Air source, underfloor',
    body: 'No gas anywhere on the site. Weather-compensated heat pumps with underfloor loops to every room.',
    span: '',
  },
  {
    key: 'glazing',
    title: 'Triple glazed, floor to ceiling',
    body: 'Slimline aluminium, argon filled, solar-controlled to the west so the evening sun warms without glare.',
    span: 'lg:col-span-2',
  },
] as const;

export default function Features() {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (reduced) {
      utils.set(grid.querySelectorAll('.spec-cell'), {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'none',
      });
      return;
    }

    const anim = animate(grid.querySelectorAll('.spec-cell'), {
      opacity: [0, 1],
      y: [64, 0],
      scale: [0.96, 1],
      filter: ['blur(14px)', 'blur(0px)'],
      duration: 1150,
      delay: stagger(110),
      ease: EASE,
      autoplay: onScroll({ target: grid, enter: 'bottom-=100 top', repeat: false }),
    });

    return () => {
      anim.revert();
    };
  }, [reduced]);

  return (
    <section id="specification" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <SectionHeading
          eyebrow="Specification"
          title="Warm in February."
          accent="Cool in August."
          copy="Every house is built to the same fabric standard, whichever type you choose. The specification below is standard, not an upgrade list."
        />

        <div ref={gridRef} className="mt-16 grid gap-5 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {/* performance cell with the section drawing */}
          <div className="spec-cell sm:col-span-2" style={{ opacity: 0 }}>
            <TiltCard className="h-full" max={7}>
              <div className="glass gradient-border flex h-full flex-col justify-between gap-8 rounded-3xl p-8 sm:p-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-amber">
                    Typical section
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    An EPC A that stays an A
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-dim">
                    Modelled with PHPP and tested on completion, not estimated from a spreadsheet.
                    Running costs are issued in writing before you reserve.
                  </p>
                </div>
                <div className="h-36 w-full sm:h-40">
                  <SectionDrawing />
                </div>
              </div>
            </TiltCard>
          </div>

          {SPEC.map((s) => (
            <div key={s.key} className={`spec-cell ${s.span}`} style={{ opacity: 0 }}>
              <TiltCard className="h-full" max={8}>
                <div className="glass group/card flex h-full flex-col gap-5 rounded-3xl p-8">
                  <span className="neu grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-amber transition-transform duration-500 ease-out group-hover/card:scale-110">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden
                    >
                      {ICONS[s.key]}
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-dim">{s.body}</p>
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}

          <div className="spec-cell" style={{ opacity: 0 }}>
            <TiltCard className="h-full" max={8}>
              <div className="glass group/card flex h-full flex-col gap-5 rounded-3xl p-8">
                <span className="neu grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-amber transition-transform duration-500 ease-out group-hover/card:scale-110">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden
                  >
                    {ICONS.warranty}
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">10-year warranty</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-dim">
                    Structural cover from completion, plus a two-year defects period we answer
                    ourselves rather than routing to a call centre.
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
