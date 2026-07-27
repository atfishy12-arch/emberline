'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect } from '@/lib/hooks';
import MagneticButton from '../ui/MagneticButton';

const LINKS = [
  { id: 'collection', label: 'The homes' },
  { id: 'specification', label: 'Specification' },
  { id: 'process', label: 'How it works' },
  { id: 'availability', label: 'Availability' },
  { id: 'faq', label: 'FAQ' },
] as const;

const OBSERVED = ['hero', 'about', ...LINKS.map((l) => l.id), 'showcase', 'numbers', 'contact'];

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState('hero');
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!headerRef.current) return;
    animate(headerRef.current, {
      y: [-90, 0],
      opacity: [0, 1],
      duration: 950,
      delay: 240,
      ease: EASE,
    });
  }, []);

  useEffect(() => {
    let prev = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setCondensed(y > 40);
      setHidden(y > 440 && y > prev && !open);
      prev = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    if (!headerRef.current) return;
    animate(headerRef.current, { y: hidden ? -110 : 0, duration: 520, ease: EASE });
  }, [hidden]);

  /* Active-section highlighting: a band across the middle of the viewport
     decides which section currently owns the nav. */
  useEffect(() => {
    const sections = OBSERVED.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const winner = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (winner) setActive(winner.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* Slide the highlight to the active link. Measuring the real anchor keeps it
     correct across font loading and viewport changes. */
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;

    const move = () => {
      const target = list.querySelector<HTMLElement>(`[data-nav="${active}"]`);
      if (!target) {
        animate(pill, { opacity: 0, duration: 200, ease: EASE });
        return;
      }
      animate(pill, {
        x: target.offsetLeft,
        width: target.offsetWidth,
        opacity: 1,
        duration: 620,
        ease: EASE,
      });
    };

    move();
    window.addEventListener('resize', move);
    return () => window.removeEventListener('resize', move);
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !open) return;

    animate(sheet, { opacity: [0, 1], duration: 320, ease: EASE });
    animate(sheet.querySelectorAll('.sheet-item'), {
      y: ['110%', '0%'],
      opacity: [0, 1],
      duration: 800,
      delay: stagger(65, { start: 90 }),
      ease: EASE,
    });
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        style={{ opacity: 0 }}
        className="fixed inset-x-0 top-0 z-[90] flex justify-center px-4 pt-4 sm:pt-5"
      >
        <nav
          className={`flex w-full max-w-6xl items-center justify-between rounded-full transition-all duration-500 ${
            condensed
              ? 'glass gradient-border px-4 py-2.5 sm:px-5'
              : 'border border-transparent px-4 py-3 sm:px-5'
          }`}
        >
          <a href="#hero" className="flex items-center gap-2.5" data-cursor="action">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber via-ember to-flame">
              <span className="absolute inset-[1px] rounded-[11px] bg-ink/85" />
              <span className="relative font-display text-lg italic leading-none">E</span>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Emberline<span className="text-ember">.</span>
            </span>
          </a>

          <ul ref={listRef} className="relative hidden items-center gap-1 md:flex">
            <span
              ref={pillRef}
              aria-hidden
              style={{ opacity: 0 }}
              className="absolute left-0 top-1/2 h-9 -translate-y-1/2 rounded-full bg-ash/10 ring-1 ring-ash/15"
            />
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  data-nav={link.id}
                  data-cursor="action"
                  aria-current={active === link.id ? 'true' : undefined}
                  className={`relative block rounded-full px-4 py-2 text-[13.5px] transition-colors duration-300 ${
                    active === link.id ? 'text-ash' : 'text-ash/55 hover:text-ash/90'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <MagneticButton
              as="a"
              href="#contact"
              className="hidden h-10 rounded-full bg-ash px-5 text-[13.5px] font-semibold text-ink sm:inline-flex"
              glowClassName="from-amber/50 via-ember/60 to-flame/50"
            >
              Book a viewing
            </MagneticButton>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="glass-soft grid h-10 w-10 place-items-center rounded-full md:hidden"
              data-cursor="action"
            >
              <span className="relative block h-3 w-4">
                <span
                  className="absolute inset-x-0 top-0 h-[1.5px] rounded bg-ash transition-transform duration-300"
                  style={open ? { transform: 'translateY(5px) rotate(45deg)' } : undefined}
                />
                <span
                  className="absolute inset-x-0 top-[5px] h-[1.5px] rounded bg-ash transition-opacity duration-200"
                  style={open ? { opacity: 0 } : undefined}
                />
                <span
                  className="absolute inset-x-0 top-[10px] h-[1.5px] rounded bg-ash transition-transform duration-300"
                  style={open ? { transform: 'translateY(-5px) rotate(-45deg)' } : undefined}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          ref={sheetRef}
          style={{ opacity: 0 }}
          className="fixed inset-0 z-[88] md:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-ink/90 backdrop-blur-2xl" />
          <ul className="relative flex h-full flex-col items-start justify-center gap-1 px-8">
            {[...LINKS, { id: 'contact', label: 'Book a viewing' }].map((link) => (
              <li key={link.id} className="overflow-hidden">
                <a
                  href={`#${link.id}`}
                  className="sheet-item block py-2 text-[2.1rem] font-semibold tracking-tight text-ash/90"
                  style={{ opacity: 0 }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
