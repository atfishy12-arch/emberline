'use client';

import { useRef, useState } from 'react';
import { animate } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';

const ITEMS = [
  {
    q: 'Can we change the layout?',
    a: 'Within reason, and only before we pour the first floor slab. Moving internal partitions and swapping a bedroom for a study is routine. Moving structure, the stair core or anything on the west elevation is not — those are what make the house perform.',
  },
  {
    q: 'What is actually included in the price?',
    a: 'The house, finished and landscaped to your plot boundary, with kitchen, bathrooms, joinery, flooring, heating and the garage where shown. No carpet allowances, no "turf to front only". The only extras people usually add are blinds and a studio outbuilding.',
  },
  {
    q: 'Can we buy off-plan before completion?',
    a: 'Yes — most people do. You reserve for £5,000, exchange at 10% roughly four months later, and complete on practical completion. Your price is fixed at reservation even though the build runs another eighteen months.',
  },
  {
    q: 'How energy efficient is it, really?',
    a: 'Every house is modelled in PHPP and air-tightness tested on completion, and we hand you the certificate. Our completed houses run between £45 and £70 a month for all heating, hot water and power. We will show you real bills from residents.',
  },
  {
    q: 'What happens if something goes wrong after we move in?',
    a: 'You get a two-year defects period answered by the people who built the house, plus a ten-year structural warranty. There is no portal and no ticket number — you call the site manager whose number is in your handover pack.',
  },
  {
    q: 'Is there a management company or service charge?',
    a: 'No service charge. The lane and the woodland are held by a residents company limited by guarantee, which every owner joins at completion. The current contribution is £340 a year and covers lane maintenance and tree work.',
  },
] as const;

function Item({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  /**
   * Height animates from the measured `scrollHeight` and is then cleared, so
   * the panel can still reflow if the viewport changes while it is open.
   */
  useIsomorphicLayoutEffect(() => {
    const body = bodyRef.current;
    const icon = iconRef.current;
    if (!body) return;

    if (reduced) {
      body.style.height = open ? 'auto' : '0px';
      body.style.opacity = open ? '1' : '0';
      return;
    }

    const target = open ? body.scrollHeight : 0;

    const anim = animate(body, {
      height: [body.offsetHeight, target],
      opacity: open ? [0, 1] : [1, 0],
      duration: open ? 640 : 460,
      ease: EASE,
      onComplete: () => {
        if (open) body.style.height = 'auto';
      },
    });

    const spin = icon ? animate(icon, { rotate: open ? 45 : 0, duration: 520, ease: EASE }) : null;

    return () => {
      anim.revert();
      spin?.revert();
    };
  }, [open, reduced]);

  return (
    <div className="glass-soft overflow-hidden rounded-2xl transition-colors duration-500 hover:bg-ash/[0.06]">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          data-cursor="action"
          className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left sm:px-8"
        >
          <span className="text-[16px] font-medium tracking-tight sm:text-[17.5px]">{q}</span>
          <span
            ref={iconRef}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ash/8 text-amber ring-1 ring-ash/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>

      <div ref={bodyRef} style={{ height: 0, opacity: 0 }} className="overflow-hidden">
        <p className="px-6 pb-7 text-[15px] leading-relaxed text-dim sm:px-8">{a}</p>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="Questions"
              title="The ones people"
              accent="ask on the plot."
              align="left"
              copy="If yours is not here, the form below reaches Kate, who runs sales, not a call centre."
            />
          </div>

          <Reveal from="right" delay={100}>
            <div className="space-y-3">
              {ITEMS.map((item, i) => (
                <Item key={item.q} q={item.q} a={item.a} index={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
