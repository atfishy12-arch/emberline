'use client';

import { useRef } from 'react';
import { animate, onScroll, scrambleText } from 'animejs';
import { LINEAR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
  chars?: string;
  /** Re-scramble whenever the pointer enters. Good for stat labels. */
  onHover?: boolean;
}

/**
 * Terminal-style character scramble that resolves into the real string.
 * Used sparingly — on monospace labels and section indices — so it reads as
 * a deliberate accent rather than a gimmick.
 */
export default function ScrambleText({
  text,
  className = '',
  duration = 1400,
  chars = 'A-Z0-9#%',
  onHover = false,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const run = (auto?: ReturnType<typeof onScroll>) =>
      animate(el, {
        text: scrambleText({ text, chars, revealRate: 34, perturbation: 0.35 }),
        duration,
        ease: LINEAR,
        ...(auto ? { autoplay: auto } : {}),
      });

    const anim = run(onScroll({ target: el, enter: 'bottom-=40 top', repeat: false }));

    const replay = () => run();
    if (onHover) el.addEventListener('pointerenter', replay);

    return () => {
      if (onHover) el.removeEventListener('pointerenter', replay);
      anim.revert();
    };
  }, [text, chars, duration, onHover, reduced]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
