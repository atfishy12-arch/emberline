'use client';

import { type ReactNode, useRef } from 'react';
import { animate, onScroll } from 'animejs';
import { LINEAR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

interface SceneProps {
  children: ReactNode;
  className?: string;
  /** How far the scene recedes as it leaves. 1 = no recede. */
  depth?: number;
}

/**
 * Makes a section behave like a shot in a sequence: as it scrolls off the top
 * it recedes, dims and drifts up, so the next section reads as arriving *over*
 * it rather than merely after it. Cumulatively this is what gives a long page
 * a sense of depth instead of feeling like a list.
 *
 * Only `transform` and `opacity` are animated (both compositor-only), and the
 * scrub is bound to scroll so it costs nothing when the user is still.
 *
 * Do not wrap sections containing `position: sticky` children — a transformed
 * ancestor becomes their containing block and changes where they stick.
 */
export default function Scene({ children, className = '', depth = 0.94 }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner || reduced) return;

    const anim = animate(inner, {
      scale: [1, depth],
      opacity: [1, 0.22],
      y: [0, -70],
      ease: LINEAR,
      autoplay: onScroll({
        target: el,
        // Scrubs across the whole time the section is passing the top edge.
        enter: 'start start',
        leave: 'start end',
        sync: 0.3,
      }),
    });

    return () => {
      anim.revert();
    };
  }, [depth, reduced]);

  /* A plain wrapper, not a <section>: the child already renders its own
     landmark element with the id the nav observes. */
  return (
    <div ref={ref} className={className}>
      <div ref={innerRef} className="gpu origin-top">
        {children}
      </div>
    </div>
  );
}
