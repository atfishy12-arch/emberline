'use client';

import { useEffect, useRef } from 'react';
import { animate, utils } from 'animejs';
import { LINEAR } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/** Board alphabet. Order matters — cells flip forward through it, as a real one does. */
const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,'£$€-–/&!?:%+";

/** ms per flap. Real boards run ~30-60ms; below ~25 it stops reading as mechanical. */
const STEP_MS = 34;
/** Cap the travel so a distant letter doesn't spin for two seconds. */
const MAX_STEPS = 14;

interface SplitFlapProps {
  text: string;
  className?: string;
  /** Extra ms of delay per column, producing the cascade across the board. */
  cascade?: number;
  /** Visual size of one cell. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Force a fixed column count. Without it the board resizes to each message
   * and the layout jumps every time the text cycles.
   */
  columns?: number;
}

const SIZES = {
  sm: 'h-9 w-[0.68em] text-[15px] sm:h-10 sm:text-[17px]',
  md: 'h-12 w-[0.66em] text-[22px] sm:h-14 sm:text-[26px]',
  lg: 'h-14 w-[0.64em] text-[26px] sm:h-20 sm:text-[40px]',
} as const;

/**
 * Split-flap (departure board) text.
 *
 * Each cell steps *forward* through a fixed alphabet to reach its target, the
 * way the physical mechanism can only rotate one way — which is why a board
 * shows nonsense letters mid-change rather than cross-fading. Columns are
 * staggered so the change sweeps left to right.
 *
 * The glyph swap is driven from a single animation per cell writing
 * `textContent` directly: React never re-renders during a flip, so a 40-cell
 * board costs 40 style writes a frame instead of 40 reconciliations.
 */
export default function SplitFlap({
  text,
  className = '',
  cascade = 26,
  size = 'md',
  columns,
}: SplitFlapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  /** Current glyph per cell, keyed "line:col" — survives text changes. */
  const currentRef = useRef<Map<string, string>>(new Map());
  const reduced = useReducedMotion();

  const lines = text.toUpperCase().split('\n');
  /** Every line padded to the widest, so the board is a true rectangle. */
  const width = columns ?? Math.max(...lines.map((l) => l.length));

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cells = Array.from(root.querySelectorAll<HTMLElement>('[data-cell]'));

    if (reduced) {
      cells.forEach((cell) => {
        const target = cell.dataset.target ?? ' ';
        cell.querySelector('.flap-char')!.textContent = target;
        currentRef.current.set(cell.dataset.cell!, target);
      });
      return;
    }

    const anims = cells.map((cell) => {
      const key = cell.dataset.cell!;
      const target = (cell.dataset.target ?? ' ').toUpperCase();
      const glyph = cell.querySelector<HTMLElement>('.flap-char')!;
      const from = currentRef.current.get(key) ?? ' ';

      const fromIdx = Math.max(0, CHARS.indexOf(from));
      const toIdx = Math.max(0, CHARS.indexOf(target));

      if (fromIdx === toIdx) {
        // Nothing to flap, but the cell must still *show* the character —
        // otherwise an unchanged cell renders blank forever.
        glyph.textContent = target;
        currentRef.current.set(key, target);
        return null;
      }

      // Forward-only travel, wrapping through the end of the alphabet.
      let distance = (toIdx - fromIdx + CHARS.length) % CHARS.length;
      let startIdx = fromIdx;
      if (distance > MAX_STEPS) {
        // Too far: jump most of the way, then flap the last stretch so the
        // landing still reads mechanical.
        startIdx = (toIdx - MAX_STEPS + CHARS.length) % CHARS.length;
        distance = MAX_STEPS;
      }

      const col = Number(cell.dataset.col ?? 0);
      const box = { i: 0 };
      let lastRendered = -1;

      const anim = animate(box, {
        i: distance,
        duration: distance * STEP_MS,
        delay: col * cascade,
        ease: LINEAR,
        onUpdate: () => {
          const step = Math.min(distance, Math.floor(box.i));
          if (step === lastRendered) return;
          lastRendered = step;
          glyph.textContent = CHARS[(startIdx + step) % CHARS.length];
          // A short fold on every discrete change; the transform is reset by
          // the next step, so it never accumulates.
          utils.set(glyph, { rotateX: -62, opacity: 0.55 });
          animate(glyph, {
            rotateX: 0,
            opacity: 1,
            duration: STEP_MS * 0.9,
            ease: LINEAR,
          });
        },
        onComplete: () => {
          glyph.textContent = target;
          utils.set(glyph, { rotateX: 0, opacity: 1 });
          currentRef.current.set(key, target);
        },
      });

      return anim;
    });

    return () => {
      anims.forEach((a) => a?.revert());
    };
  }, [text, cascade, reduced]);

  return (
    <div
      ref={rootRef}
      className={`flex flex-col items-center gap-1.5 font-mono ${className}`}
      role="img"
      aria-label={text.replace(/\n/g, '. ')}
    >
      {lines.map((line, li) => (
        <div key={li} className="flex gap-[3px]">
          {Array.from({ length: width }, (_, ci) => {
            const char = line[ci] ?? ' ';
            return (
              <span
                key={ci}
                data-cell={`${li}:${ci}`}
                data-col={ci}
                data-target={char}
                aria-hidden
                className={`relative grid place-items-center overflow-hidden rounded-[3px] bg-gradient-to-b from-[#241a14] to-[#120c08] font-semibold text-ash shadow-[inset_0_1px_0_rgba(255,200,160,0.09),0_2px_6px_-3px_rgba(0,0,0,0.9)] [perspective:220px] ${SIZES[size]}`}
              >
                {/* the hinge — the single detail that makes it read as split-flap */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-black/60"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/[0.06] to-transparent to-50%"
                />
                <span className="flap-char block leading-none will-change-transform">&nbsp;</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
