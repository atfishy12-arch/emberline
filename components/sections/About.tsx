'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { animate, onScroll, stagger, utils } from 'animejs';
import { easeOut } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import Reveal from '../ui/Reveal';
import ScrollHighlight from '../ui/ScrollHighlight';
import SplitReveal from '../ui/SplitReveal';
import Parallax from '../ui/Parallax';

const PRINCIPLES = [
  {
    n: '01',
    title: 'Built for the last hour of sun',
    body: 'Every plot was set on site, not on a drawing. We walked the ridge at six in the evening in February and again in July, and the houses sit where the light lands.',
  },
  {
    n: '02',
    title: 'Heavy materials, honestly used',
    body: 'Board-marked concrete, burnt larch, oiled oak. Nothing clad to look like something else, and nothing that needs replacing in fifteen years.',
  },
  {
    n: '03',
    title: 'Twenty-four, then we stop',
    body: 'This is the whole site. There is no Phase Three, no second release at a higher price. When the last plot goes, Emberline is finished here.',
  },
] as const;

/**
 * Scroll-storytelling: a sticky material study holds while the principles
 * scroll past it, so the reader's eye stays anchored and the section reads as
 * one continuous argument rather than three stacked cards.
 */
export default function About() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    /* Reduced motion must still *show* the content — resolve to the end
       state rather than bailing out and leaving it at opacity 0. */
    if (reduced) {
      utils.set(list.querySelectorAll('.principle'), { opacity: 1, y: 0, filter: 'none' });
      utils.set(list.querySelectorAll('.principle-rule'), { scaleX: 1 });
      return;
    }

    const items = animate(list.querySelectorAll('.principle'), {
      opacity: [0, 1],
      y: [64, 0],
      filter: ['blur(12px)', 'blur(0px)'],
      duration: 1100,
      delay: stagger(150),
      ease: easeOut(3),
      autoplay: onScroll({ target: list, enter: 'bottom-=120 top', repeat: false }),
    });

    const rules = animate(list.querySelectorAll('.principle-rule'), {
      scaleX: [0, 1],
      duration: 1300,
      delay: stagger(150, { start: 260 }),
      ease: easeOut(3),
      autoplay: onScroll({ target: list, enter: 'bottom-=120 top', repeat: false }),
    });

    return () => {
      items.revert();
      rules.revert();
    };
  }, [reduced]);

  return (
    <section id="about" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {/* ---------- sticky material study ---------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal from="scale" duration={1200}>
              <div className="zoom-frame group relative aspect-[4/5] w-full" data-cursor="view">
                <Parallax distance={70} smooth={0.2} className="absolute inset-0">
                  {/* Duotone rather than a hue rotation: the source is an
                      abstract light study, and rotating its hue would send the
                      cool half magenta. Desaturating and tinting keeps one
                      coherent ember range. */}
                  <Image
                    src="/art/texture.png"
                    alt="Material study — light raking across burnt larch"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                    style={{ filter: 'grayscale(1) contrast(1.15) brightness(0.72)' }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 mix-blend-color"
                    style={{
                      background:
                        'linear-gradient(150deg, #FF2D46 0%, #FF5A1F 45%, #FFB020 100%)',
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 mix-blend-overlay opacity-70"
                    style={{
                      background:
                        'radial-gradient(70% 60% at 30% 20%, rgba(255,176,32,0.5), transparent 65%)',
                    }}
                  />
                </Parallax>

                <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-ash/12" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

                <div className="glass absolute bottom-5 left-5 right-5 rounded-2xl px-5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-faint">
                    Material study 04 — Burnt larch
                  </p>
                  <p className="mt-1.5 text-sm text-ash/80">
                    Charred, brushed and oiled on site. It weathers to silver-grey and never
                    needs painting.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ---------- narrative ---------- */}
          <div className="pt-2">
            <Reveal from="down" duration={700}>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 animate-flicker rounded-full bg-amber shadow-[0_0_12px_3px_rgba(255,176,32,0.9)]" />
                The approach
              </span>
            </Reveal>

            <h2 className="mt-6 text-display-sm font-semibold">
              <SplitReveal text="We build slowly," />
              <br />
              <SplitReveal
                text="and not very many."
                delay={130}
                className="gradient-text font-display font-normal italic"
              />
            </h2>

            {/* Scroll-lit: the reader's scroll position *is* the reveal, which
                makes the paragraph feel authored rather than faded in. */}
            <ScrollHighlight
              text="Emberline is four people and one site. We have built eleven houses in six years, and every one of them was drawn, costed and finished by the same hands. The rules below are why people wait for us."
              className="mt-8 max-w-[26ch] text-[26px] font-medium leading-[1.3] tracking-tight sm:text-[31px]"
            />

            <ol ref={listRef} className="mt-14 space-y-12">
              {PRINCIPLES.map((p) => (
                <li key={p.n} className="principle" style={{ opacity: 0 }}>
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-sm text-amber">{p.n}</span>
                    <h3 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-4 max-w-[52ch] pl-[3.1rem] text-[15px] leading-relaxed text-dim">
                    {p.body}
                  </p>
                  <div
                    className="principle-rule mt-8 h-px origin-left bg-gradient-to-r from-ember/50 via-amber/25 to-transparent"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
