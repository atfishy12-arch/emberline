'use client';

import { type ElementType, useRef } from 'react';
import { animate, onScroll, splitText, stagger, utils } from 'animejs';
import { LINEAR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

interface ScrollHighlightProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** Colour the words resolve to. Dimmed words sit at 18% of this. */
  dim?: number;
}

/**
 * Copy that lights up word by word as it crosses the viewport.
 *
 * The whole sweep is bound to scroll position (`sync`), not a clock — the
 * reader controls the pace, and the text is legible the entire time because
 * it never drops below `dim`. This is the section-scale storytelling beat:
 * one long sentence that resolves as you travel through it.
 */
export default function ScrollHighlight({
  text,
  as: tag = 'p',
  className = '',
  dim = 0.16,
}: ScrollHighlightProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = tag as any;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      utils.set(el, { opacity: 1 });
      return;
    }

    utils.set(el, { opacity: 1 });

    const split = splitText(el, { words: {}, accessible: true });

    const anim = animate(split.words, {
      opacity: [dim, 1],
      // Each word's reveal is offset along the shared scroll range, which is
      // what produces the travelling wave rather than a uniform fade.
      duration: 100,
      delay: stagger(40),
      ease: LINEAR,
      autoplay: onScroll({
        target: el,
        enter: 'end-=8% start',
        leave: 'start+=42% end',
        sync: 0.32,
      }),
    });

    return () => {
      anim.revert();
      split.revert();
    };
  }, [text, dim, reduced]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {text}
    </Tag>
  );
}
