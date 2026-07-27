'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { animate, createAnimatable, createTimeline, onScroll, spring, stagger, utils } from 'animejs';
import { EASE, LINEAR, SPRING } from '@/lib/motion';
import {
  useAppReady,
  useInViewport,
  useIsomorphicLayoutEffect,
  useIsTouch,
  useReducedMotion,
} from '@/lib/hooks';
import MagneticButton from '../ui/MagneticButton';
import SplitReveal from '../ui/SplitReveal';

/* WebGL is ~200 kB of three.js — keep it out of the initial bundle and off
   the server render entirely. */
const HouseScene = dynamic(() => import('../three/HouseScene'), { ssr: false });

const FLOATING = [
  {
    id: 'phase',
    label: 'Now releasing',
    value: 'Phase II',
    sub: '9 of 24 homes remain',
    className: 'left-[2%] top-[22%] lg:left-[3%]',
    depth: 26,
  },
  {
    id: 'epc',
    label: 'Energy rating',
    value: 'EPC A',
    sub: 'air source, triple glazed',
    className: 'bottom-[22%] left-[7%] lg:left-[5%]',
    depth: 18,
  },
  {
    id: 'from',
    label: 'From',
    value: '£845,000',
    sub: 'freehold, 3–5 bed',
    className: 'right-[4%] top-[17%] lg:right-[7%]',
    depth: 34,
  },
] as const;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const ready = useAppReady();
  const inView = useInViewport(sectionRef, '0px');
  const touch = useIsTouch();
  const reduced = useReducedMotion();

  /* Entrance — begins as the preloader curtain lifts, so the two moves
     overlap into one continuous reveal rather than queueing. */
  useIsomorphicLayoutEffect(() => {
    if (!ready || !copyRef.current) return;

    if (reduced) {
      utils.set(copyRef.current.querySelectorAll('.hero-fade'), { opacity: 1, y: 0, scale: 1 });
      utils.set(sectionRef.current!.querySelectorAll('.hero-card, .hero-scroll'), {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'none',
      });
      return;
    }

    const tl = createTimeline({ defaults: { ease: EASE } });

    tl.add('.hero-eyebrow', { opacity: [0, 1], y: [20, 0], duration: 800 }, 0)
      .add('.hero-rule', { scaleX: [0, 1], duration: 1400 }, 200)
      .add('.hero-sub', { opacity: [0, 1], y: [28, 0], duration: 1000 }, 700)
      .add(
        '.hero-cta',
        { opacity: [0, 1], y: [30, 0], scale: [0.94, 1], duration: 1000, delay: stagger(110) },
        860
      )
      .add('.hero-meta', { opacity: [0, 1], duration: 1000 }, 1080)
      .add(
        // No `y`: the pointer-parallax animatable below owns y on these nodes,
        // and two writers on one property fight each other.
        '.hero-card',
        { opacity: [0, 1], scale: [0.84, 1], filter: ['blur(18px)', 'blur(0px)'], duration: 1500, delay: stagger(160) },
        760
      )
      .add('.hero-scroll', { opacity: [0, 1], y: [-16, 0], duration: 800 }, 1500);

    return () => {
      tl.revert();
    };
  }, [ready, reduced]);

  /**
   * Scroll-out choreography — a dolly, not a fade. Each layer gets its own
   * observer and targets a *container*, leaving the entrance timeline and the
   * pointer parallax to own the inner nodes uncontested.
   */
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const copy = copyRef.current;
    const cards = cardsRef.current;
    if (!section || !scene || !copy || !cards || reduced) return;

    const range = { target: section, enter: 'start start', leave: 'start end', sync: 0.28 } as const;

    const sceneOut = animate(scene, {
      scale: [1, 1.18],
      opacity: [1, 0.15],
      ease: LINEAR,
      autoplay: onScroll({ ...range }),
    });

    const copyLift = animate(copy, {
      y: [0, -170],
      opacity: [1, 0],
      ease: LINEAR,
      autoplay: onScroll({ ...range }),
    });

    // Cards travel furthest, which reads as them being nearest the camera.
    const cardsLift = animate(cards, {
      y: [0, -280],
      opacity: [1, 0],
      ease: LINEAR,
      autoplay: onScroll({ ...range }),
    });

    return () => {
      sceneOut.revert();
      copyLift.revert();
      cardsLift.revert();
    };
  }, [reduced]);

  /* Floating cards drift against the pointer for depth. */
  useIsomorphicLayoutEffect(() => {
    const host = cardsRef.current;
    if (!host || touch || reduced) return;

    const cards = Array.from(host.querySelectorAll<HTMLElement>('.hero-card'));
    const rigs = cards.map((card) =>
      createAnimatable(card, { x: 0, y: 0, rotate: 0, ease: spring(SPRING.tilt) })
    );

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      rigs.forEach((rig, i) => {
        const depth = Number(cards[i].dataset.depth ?? 20);
        rig.x(-nx * depth);
        rig.y(-ny * depth);
        rig.rotate(-nx * depth * 0.08);
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      rigs.forEach((r) => r.revert());
    };
  }, [touch, reduced]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* ---------- real-time architectural layer ---------- */}
      <div ref={sceneRef} className="gpu absolute inset-0 -z-[5]">
        <HouseScene active={inView} />
      </div>

      {/* legibility scrim, weighted to the copy side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[4] bg-[linear-gradient(100deg,rgba(10,7,5,0.95)_0%,rgba(10,7,5,0.78)_36%,rgba(10,7,5,0.25)_62%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-[4] h-72 bg-gradient-to-t from-ink via-ink/75 to-transparent"
      />

      {/* ---------- floating detail cards ---------- */}
      <div ref={cardsRef} className="pointer-events-none absolute inset-0 hidden lg:block">
        {FLOATING.map((card) => (
          <div
            key={card.id}
            data-depth={card.depth}
            style={{ opacity: 0 }}
            className={`hero-card absolute ${card.className}`}
          >
            <div className="glass gradient-border animate-float rounded-2xl px-5 py-4 [animation-duration:9s]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-faint">{card.label}</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-0.5 text-[11px] text-faint">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- copy ---------- */}
      <div className="container relative z-10 pt-28 sm:pt-32">
        <div ref={copyRef} className="max-w-3xl">
          <span className="hero-eyebrow eyebrow hero-fade" style={{ opacity: 0 }}>
            <span className="h-1.5 w-1.5 animate-flicker rounded-full bg-ember shadow-[0_0_12px_3px_rgba(255,90,31,0.95)]" />
            Emberline — Phase Two now released
          </span>

          <h1 className="mt-8 text-display font-semibold">
            <SplitReveal text="Homes that hold" play={ready} delay={200} />
            <br />
            <SplitReveal
              text="the light."
              play={ready}
              delay={380}
              className="gradient-text font-display font-normal italic"
            />
          </h1>

          <div
            className="hero-rule rule mt-9 max-w-md origin-left"
            style={{ transform: 'scaleX(0)' }}
          />

          <p
            className="hero-sub hero-fade mt-8 max-w-xl text-base leading-relaxed text-dim sm:text-lg"
            style={{ opacity: 0 }}
          >
            Twenty-four architect-led houses set into the western ridge. Board-marked concrete,
            burnt larch and glass that runs floor to ceiling — built to catch the last hour of
            sun and keep it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3.5">
            <MagneticButton
              as="a"
              href="#collection"
              className="hero-cta hero-fade h-14 rounded-full bg-ash px-8 text-[15px] font-semibold text-ink"
              glowClassName="from-amber/60 via-ember/60 to-flame/60"
              style={{ opacity: 0 }}
            >
              View the collection
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticButton>

            <MagneticButton
              as="a"
              href="#contact"
              className="hero-cta hero-fade glass gradient-border h-14 rounded-full px-8 text-[15px] font-medium"
              glowClassName="from-ember/50 via-flame/40 to-amber/40"
              style={{ opacity: 0 }}
            >
              Book a private viewing
            </MagneticButton>
          </div>

          <div
            className="hero-meta hero-fade mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-faint"
            style={{ opacity: 0 }}
          >
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-ember" />
              Completion from Spring 2027
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-amber" />
              Reservations from £5,000
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-flame" />
              10-year structural warranty
            </span>
          </div>
        </div>
      </div>

      {/* ---------- scroll indicator ---------- */}
      <a
        href="#about"
        aria-label="Scroll to next section"
        data-cursor="action"
        style={{ opacity: 0 }}
        className="hero-scroll absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-faint">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-ash/15">
          <span className="absolute inset-x-0 top-0 h-1/3 animate-[scroll-hint_2.2s_ease-in-out_infinite] bg-gradient-to-b from-ember to-transparent" />
        </span>
      </a>
    </section>
  );
}
