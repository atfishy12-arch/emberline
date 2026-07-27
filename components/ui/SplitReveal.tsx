'use client';

import { type ElementType, useRef } from 'react';
import { animate, onScroll, splitText, stagger, utils } from 'animejs';
import { EASE, DUR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

interface SplitRevealProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** Split granularity. Words read best on display type; chars on short labels. */
  unit?: 'words' | 'chars' | 'lines';
  delay?: number;
  stagger?: number;
  duration?: number;
  /**
   * `true`/`false` drives the animation directly (the hero waits on the
   * preloader). Omit it and the reveal is scroll-triggered instead.
   */
  play?: boolean;
}

/**
 * Masked text reveal built on anime.js `splitText`.
 *
 * Each unit is wrapped in an overflow-clipped span and rides up from below
 * with a slight rotation, which reads far more expensive than an opacity
 * fade. `accessible: true` keeps the original string exposed to screen
 * readers instead of a pile of disconnected spans.
 */
export default function SplitReveal({
  text,
  as: tag = 'span',
  className = '',
  unit = 'words',
  delay = 0,
  stagger: staggerMs = 78,
  duration = DUR.slow,
  play,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  /* See MagneticButton: open ElementType unions can't be resolved at the JSX
     call site, so the rendered tag is loosened while props stay typed. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = tag as any;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      utils.set(el, { opacity: 1 });
      return;
    }
    // Driven mode: hold invisible until the caller says go.
    if (play === false) {
      utils.set(el, { opacity: 0 });
      return;
    }

    utils.set(el, { opacity: 1 });

    const split = splitText(el, {
      words: unit === 'words' ? { wrap: 'clip' } : false,
      chars: unit === 'chars' ? { wrap: 'clip' } : false,
      lines: unit === 'lines' ? { wrap: 'clip' } : false,
      accessible: true,
    });

    const targets =
      unit === 'chars' ? split.chars : unit === 'lines' ? split.lines : split.words;

    const anim = animate(targets, {
      y: ['118%', '0%'],
      rotate: [7, 0],
      opacity: [0, 1],
      duration,
      delay: stagger(staggerMs, { start: delay }),
      ease: EASE,
      ...(play === undefined
        ? {
            autoplay: onScroll({
              target: el,
              enter: 'bottom-=60 top',
              repeat: false,
            }),
          }
        : {}),
    });

    return () => {
      anim.revert();
      split.revert();
    };
  }, [text, unit, delay, staggerMs, duration, play, reduced]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {text}
    </Tag>
  );
}
