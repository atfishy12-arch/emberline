'use client';

import { useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { EASE } from '@/lib/motion';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';
import MagneticButton from '../ui/MagneticButton';
import Reveal from '../ui/Reveal';
import SplitReveal from '../ui/SplitReveal';

type Status = 'idle' | 'sending' | 'sent';

const HOUSE_OPTIONS = ['The Kiln', 'The Ridge', 'The Foundry', 'The Hearth', 'Ashgrove'];

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const successRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (status !== 'sent' || !successRef.current || reduced) return;
    animate(successRef.current.querySelectorAll('.success-item'), {
      opacity: [0, 1],
      y: [22, 0],
      duration: 720,
      delay: stagger(95),
      ease: EASE,
    });
  }, [status, reduced]);

  /**
   * No backend — this is a marketing page. The submit is simulated so the
   * interaction, validation and success states are all real and reviewable.
   */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setStatus('sending');
    window.setTimeout(() => setStatus('sent'), 1100);
  };

  const field =
    'w-full rounded-2xl bg-ash/[0.04] px-5 py-4 text-[15px] text-ash placeholder:text-ash/25 ring-1 ring-inset ring-ash/10 transition-all duration-500 focus:bg-ash/[0.07] focus:shadow-[0_0_0_1px_rgba(255,176,32,0.55),0_0_34px_-6px_rgba(255,90,31,0.7)] focus:outline-none focus:ring-amber/50';

  return (
    <section id="contact" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <div className="relative overflow-hidden rounded-[36px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(80% 90% at 20% 0%, rgba(255,90,31,0.3), transparent 62%), radial-gradient(70% 80% at 90% 100%, rgba(255,45,70,0.22), transparent 60%)',
            }}
          />
          <div className="glass gradient-border rounded-[36px] px-7 py-14 sm:px-12 sm:py-20 lg:px-20">
            <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
              {/* ---------- pitch ---------- */}
              <div>
                <Reveal from="down" duration={700}>
                  <span className="eyebrow">
                    <span className="h-1.5 w-1.5 animate-flicker rounded-full bg-ember shadow-[0_0_12px_3px_rgba(255,90,31,0.95)]" />
                    Private viewings
                  </span>
                </Reveal>

                <h2 className="mt-6 text-display-sm font-semibold">
                  <SplitReveal text="Come and walk" />
                  <br />
                  <SplitReveal
                    text="the ridge."
                    delay={130}
                    className="gradient-text font-display font-normal italic"
                  />
                </h2>

                <Reveal delay={170}>
                  <p className="mt-7 max-w-[46ch] text-base leading-relaxed text-dim sm:text-lg">
                    Viewings run Thursday to Saturday, on site, in whatever the weather is doing.
                    Wear boots — you will be standing in a field, and that is rather the point.
                  </p>
                </Reveal>

                <Reveal delay={230}>
                  <dl className="mt-12 space-y-6">
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-faint">
                        Sales office
                      </dt>
                      <dd className="mt-1.5 text-[15px] text-ash/85">
                        Ridge Farm Lane, Combe St Mary
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-faint">Direct</dt>
                      <dd className="mt-1.5 text-[15px] text-ash/85">
                        kate@emberline.co — 01823 555 0148
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.22em] text-faint">
                        Response time
                      </dt>
                      <dd className="mt-1.5 text-[15px] text-ash/85">Same working day</dd>
                    </div>
                  </dl>
                </Reveal>
              </div>

              {/* ---------- form ---------- */}
              <Reveal from="right" delay={150}>
                {status === 'sent' ? (
                  <div
                    ref={successRef}
                    className="flex h-full flex-col items-start justify-center gap-5 rounded-3xl bg-ash/[0.04] p-10 ring-1 ring-inset ring-ash/10"
                  >
                    <span className="success-item grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-amber to-flame">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="m4 12.5 5 5L20 6.5"
                          stroke="#0A0705"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <h3 className="success-item text-2xl font-semibold tracking-tight">
                      Request received.
                    </h3>
                    <p className="success-item max-w-[38ch] text-[15px] leading-relaxed text-dim">
                      Kate will call you the same working day to fix a time. If you would rather
                      email, use the address to the left.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="success-item text-[14px] text-amber underline-offset-4 hover:underline"
                      data-cursor="action"
                    >
                      Send another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-5">
                    <div className="group">
                      <label
                        htmlFor="name"
                        className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-faint transition-colors group-focus-within:text-amber"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Rachel Okonjo"
                        className={field}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="group">
                        <label
                          htmlFor="email"
                          className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-faint transition-colors group-focus-within:text-amber"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          className={field}
                        />
                      </div>
                      <div className="group">
                        <label
                          htmlFor="phone"
                          className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-faint transition-colors group-focus-within:text-amber"
                        >
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="07700 900000"
                          className={field}
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="house"
                        className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-faint transition-colors group-focus-within:text-amber"
                      >
                        House type of interest
                      </label>
                      <select id="house" name="house" className={field} defaultValue="">
                        <option value="" disabled>
                          Select a house type
                        </option>
                        {HOUSE_OPTIONS.map((h) => (
                          <option key={h} value={h} className="bg-soot">
                            {h}
                          </option>
                        ))}
                        <option value="unsure" className="bg-soot">
                          Not sure yet
                        </option>
                      </select>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="message"
                        className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-faint transition-colors group-focus-within:text-amber"
                      >
                        Anything we should know?
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="We are selling in Bristol and hoping to move summer 2027…"
                        className={`${field} resize-none`}
                      />
                    </div>

                    <MagneticButton
                      type="submit"
                      disabled={status === 'sending'}
                      className="h-14 w-full rounded-full bg-ash text-[15px] font-semibold text-ink disabled:opacity-70"
                      glowClassName="from-amber/50 via-ember/60 to-flame/50"
                    >
                      {status === 'sending' ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
                          Sending
                        </>
                      ) : (
                        <>
                          Request a viewing
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      )}
                    </MagneticButton>

                    <p className="pt-1 text-center text-[12.5px] text-faint">
                      Demo form — nothing is sent anywhere.
                    </p>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
