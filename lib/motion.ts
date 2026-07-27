/**
 * Shared motion language.
 *
 * Every animation in the site pulls its curve and rhythm from here, which is
 * what makes independently-authored sections feel like one continuous piece
 * rather than a pile of effects.
 */

import { cubicBezier, eases } from 'animejs';

/**
 * anime.js 4.5 removed the `ease: 'cubicBezier(...)'` string form — passing a
 * string now silently falls back to the default curve. These are the real
 * easing functions, so importing from here is the only way to get the house
 * motion language.
 */

/** Ease-out-expo: fast departure, long luxurious settle. The house curve. */
export const EASE = cubicBezier(0.16, 1, 0.3, 1);
/** Symmetric — for things that travel and stop, like curtains. */
export const EASE_IN_OUT = cubicBezier(0.65, 0, 0.35, 1);
/** Slight overshoot, used sparingly on small UI that should feel springy. */
export const EASE_BACK = cubicBezier(0.34, 1.56, 0.64, 1);
/** Power ease-out; higher `n` decelerates harder. */
export const easeOut = (n = 3) => eases.out(n);
/** No easing — for scroll-scrubbed animations, where scroll *is* the curve. */
export const LINEAR = eases.linear;

export const DUR = {
  micro: 220,
  fast: 420,
  base: 980,
  slow: 1400,
  cinematic: 2000,
} as const;

/** Spring presets for pointer-driven motion (magnetic, tilt, cursor). */
export const SPRING = {
  magnetic: { stiffness: 180, damping: 14, mass: 0.6 },
  tilt: { stiffness: 120, damping: 16, mass: 0.9 },
  snap: { stiffness: 240, damping: 20, mass: 0.5 },
} as const;

/**
 * Scroll trigger thresholds, in anime.js `onScroll` syntax.
 * `reveal` fires when an element's top passes 88% down the viewport — late
 * enough to be seen, early enough to finish before it's read.
 */
export const TRIGGER = {
  reveal: { enter: 'bottom-=80 top', leave: 'top bottom' },
  early: { enter: 'bottom top', leave: 'top bottom' },
} as const;

/** True when the OS asks us to calm down. Safe to call during render. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Frame-rate independent lerp factor — use instead of a fixed 0.1 per frame. */
export const damp = (lambda: number, dt: number): number => 1 - Math.exp(-lambda * dt);

export const clamp = (v: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, v));
