'use client';

import { useRef, useState } from 'react';
import { animate, onScroll } from 'animejs';
import { LINEAR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import Elevation from '../ui/Elevation';
import SplitReveal from '../ui/SplitReveal';

const HOMES = [
  {
    id: 'ridge',
    plot: '01–06',
    name: 'The Ridge',
    beds: '4 bed',
    area: '2,410 sq ft',
    price: '£1,240,000',
    body: 'Double-height living set gable-end to the valley. The whole west wall is glass.',
    status: 'available',
  },
  {
    id: 'kiln',
    plot: '07–12',
    name: 'The Kiln',
    beds: '3 bed',
    area: '1,860 sq ft',
    price: '£845,000',
    body: 'A brick chimney core with rooms wrapped around it. The warmest house on the site.',
    status: 'available',
  },
  {
    id: 'foundry',
    plot: '13–17',
    name: 'The Foundry',
    beds: '5 bed',
    area: '3,120 sq ft',
    price: '£1,690,000',
    body: 'Twin pitched volumes joined by a glazed link. Workshop below, living above.',
    status: 'reserved',
  },
  {
    id: 'hearth',
    plot: '18–21',
    name: 'The Hearth',
    beds: '4 bed',
    area: '2,240 sq ft',
    price: '£1,120,000',
    body: 'Built around a central open fire. Every room faces the courtyard.',
    status: 'available',
  },
  {
    id: 'ashgrove',
    plot: '22–24',
    name: 'Ashgrove',
    beds: '5 bed',
    area: '3,480 sq ft',
    price: 'On application',
    body: 'The three ridge-top plots. Stepped section, private woodland to the rear.',
    status: 'last three',
  },
] as const;

/**
 * Pinned horizontal collection.
 *
 * The section is tall; a sticky viewport-height child holds while the page
 * scrolls through it, and the track's `x` is scrubbed across exactly the
 * measured overflow — so vertical scroll becomes horizontal travel with no
 * wheel hijacking.
 *
 * Section height is derived from that measurement rather than hard-coded in
 * `vh`, so the pin releases precisely as the last house lands. Under reduced
 * motion the mechanism is dropped for a plain swipeable strip.
 */
export default function Collection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;

    const measure = () => setDistance(Math.max(0, Math.round(track.scrollWidth - window.innerWidth)));

    measure();
    // ResizeObserver rather than a resize listener: late font swaps and the
    // SVG elevations settling both change the track width without firing one.
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reduced || distance <= 0) return;

    const anim = animate(track, {
      x: [0, -distance],
      ease: LINEAR,
      autoplay: onScroll({
        target: section,
        // Exactly the sticky range: top-hits-top through bottom-hits-bottom.
        enter: 'start start',
        leave: 'end end',
        sync: 0.25,
      }),
    });

    return () => {
      anim.revert();
    };
  }, [distance, reduced]);

  const cards = HOMES.map((home) => (
    <article
      key={home.id}
      data-cursor="view"
      className="group glass relative flex h-[64vh] w-[80vw] shrink-0 flex-col overflow-hidden rounded-[28px] p-8 sm:h-[66vh] sm:w-[54vw] lg:w-[40vw]"
    >
      {/* plot + status */}
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-xs text-amber">Plot {home.plot}</span>
        <span
          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
            home.status === 'reserved'
              ? 'bg-ash/8 text-faint'
              : 'bg-ember/15 text-ember-soft ring-1 ring-inset ring-ember/30'
          }`}
        >
          {home.status}
        </span>
      </div>

      {/* elevation drawing */}
      <div className="relative my-6 flex-1">
        <Elevation variant={home.id} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 70%, rgba(255,90,31,0.20), transparent 70%)',
          }}
        />
      </div>

      <div>
        <h3 className="font-display text-4xl italic leading-none">{home.name}</h3>
        <p className="mt-3 max-w-[36ch] text-[14.5px] leading-relaxed text-dim">{home.body}</p>

        <dl className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-ash/10 pt-5 text-[13px]">
          <div className="flex items-baseline gap-2">
            <dt className="text-faint">Beds</dt>
            <dd className="font-medium">{home.beds}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-faint">Area</dt>
            <dd className="font-medium">{home.area}</dd>
          </div>
          <div className="ml-auto flex items-baseline gap-2">
            <dt className="text-faint">From</dt>
            <dd className="font-semibold text-amber">{home.price}</dd>
          </div>
        </dl>
      </div>
    </article>
  ));

  const heading = (
    <h2 className="max-w-[16ch] text-display-sm font-semibold">
      <SplitReveal text="Five houses." />{' '}
      <SplitReveal
        text="One ridge."
        delay={110}
        className="gradient-text font-display font-normal italic"
      />
    </h2>
  );

  if (reduced) {
    return (
      <section id="collection" className="relative py-28 sm:py-36">
        <div className="container">{heading}</div>
        <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[6vw] pb-6">
          {cards}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="collection"
      className="relative"
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="container mb-8">
          {heading}
          <p className="mt-4 max-w-[46ch] text-[15px] text-dim">
            Twenty-four homes in five types. Drag or keep scrolling.
          </p>
        </div>

        <div ref={trackRef} className="gpu flex w-max gap-6 px-[6vw]">
          {cards}
        </div>
      </div>
    </section>
  );
}
