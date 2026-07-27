'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { EASE_BACK, easeOut } from '@/lib/motion';
import { useIsomorphicLayoutEffect } from '@/lib/hooks';

export default function ScrollToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(max > 0 && window.scrollY / max > 0.18);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    animate(el, {
      opacity: show ? [0, 1] : [1, 0],
      scale: show ? [0.6, 1] : [1, 0.6],
      y: show ? [20, 0] : [0, 20],
      duration: show ? 520 : 300,
      ease: show ? EASE_BACK : easeOut(2),
    });
  }, [show]);

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      data-cursor="action"
      onClick={() => window.dispatchEvent(new CustomEvent('app:scroll-to', { detail: 0 }))}
      style={{ opacity: 0, pointerEvents: show ? 'auto' : 'none' }}
      className="glass gradient-border fixed bottom-6 right-6 z-[85] grid h-12 w-12 place-items-center rounded-full text-ash/80 transition-colors hover:text-ash sm:bottom-9 sm:right-9"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
