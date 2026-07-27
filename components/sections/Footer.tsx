'use client';

import { useRef } from 'react';
import { animate, onScroll, stagger, utils } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

const COLUMNS = [
  { title: 'The homes', links: ['The Kiln', 'The Ridge', 'The Foundry', 'The Hearth', 'Ashgrove'] },
  { title: 'Buying', links: ['Availability', 'How it works', 'Specification', 'Reserve a plot'] },
  { title: 'Emberline', links: ['Our approach', 'Completed houses', 'Press', 'Contact'] },
] as const;

export default function Footer() {
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* The oversized wordmark rises as the footer arrives — the last beat of the
     page, and the only place type this large is allowed to move. */
  useIsomorphicLayoutEffect(() => {
    const el = wordmarkRef.current;
    if (!el) return;

    if (reduced) {
      utils.set(el.querySelectorAll('.wordmark-letter'), { opacity: 1, y: 0 });
      return;
    }

    const anim = animate(el.querySelectorAll('.wordmark-letter'), {
      y: ['38%', '0%'],
      opacity: [0, 1],
      duration: 1500,
      delay: stagger(55),
      ease: EASE,
      autoplay: onScroll({ target: el, enter: 'bottom-=40 top', repeat: false }),
    });

    return () => {
      anim.revert();
    };
  }, [reduced]);

  return (
    <footer className="relative overflow-hidden border-t border-ash/8 pt-24">
      <div className="container">
        <div className="grid gap-12 pb-20 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href="#hero" className="inline-flex items-center gap-2.5" data-cursor="action">
              <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber via-ember to-flame">
                <span className="absolute inset-[1px] rounded-[11px] bg-ink/85" />
                <span className="relative font-display text-lg italic leading-none">E</span>
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                Emberline<span className="text-ember">.</span>
              </span>
            </a>
            <p className="mt-5 max-w-[34ch] text-[14px] leading-relaxed text-faint">
              Twenty-four architect-led houses on the western ridge at Combe St Mary. Phase Two
              releasing now.
            </p>

            <div className="mt-7 flex items-center gap-2.5">
              {['Instagram', 'Journal', 'LinkedIn'].map((s) => (
                <a
                  key={s}
                  href="#hero"
                  aria-label={s}
                  data-cursor="action"
                  className="glass-soft grid h-10 w-10 place-items-center rounded-full text-[11px] font-medium text-dim transition-all duration-500 hover:-translate-y-0.5 hover:text-ash"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[11px] uppercase tracking-[0.22em] text-faint">{col.title}</h2>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#hero"
                      data-cursor="action"
                      className="group inline-flex items-center gap-2 text-[14.5px] text-dim transition-colors hover:text-ash"
                    >
                      <span className="h-px w-0 bg-ember transition-all duration-500 group-hover:w-4" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* oversized wordmark */}
        <div ref={wordmarkRef} className="relative select-none pb-10">
          <div className="flex justify-between overflow-hidden" aria-hidden>
            {'EMBERLINE'.split('').map((c, i) => (
              <span
                key={i}
                className="wordmark-letter inline-block text-[clamp(2rem,10.5vw,9rem)] font-semibold leading-none tracking-tighter text-ash/[0.07]"
                style={{ opacity: 0 }}
              >
                {c}
              </span>
            ))}
          </div>
          <span className="sr-only">Emberline</span>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(320px circle at var(--mx) var(--my), rgba(255,90,31,0.2), transparent 65%)',
            }}
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-ash/8 py-8 text-[13px] text-faint sm:flex-row">
          <p>
            © 2026 Emberline Homes Ltd. Fictional demo — not a real development, and not an offer.
          </p>
          <div className="flex items-center gap-6">
            <a href="#hero" className="transition-colors hover:text-ash/70" data-cursor="action">
              Privacy
            </a>
            <a href="#hero" className="transition-colors hover:text-ash/70" data-cursor="action">
              Reservation terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
