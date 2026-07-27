/**
 * The page's atmosphere: a warm charcoal base with ember fields drifting
 * through it, a cursor-lit survey grid, and a heat glow that follows the
 * pointer.
 *
 * Every layer is fixed and composited — no layout, no paint on scroll.
 * `--mx/--my` are written once per frame by CursorGlow.
 *
 * Server component: no interactivity of its own.
 */
export default function Ember({ intensity = 1 }: { intensity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />

      {/* horizon glow — the fire is always just off-frame, below */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 118%, rgba(255,90,31,0.30), transparent 62%), radial-gradient(90% 60% at 82% 8%, rgba(255,45,70,0.14), transparent 58%), radial-gradient(80% 70% at 8% 92%, rgba(255,176,32,0.12), transparent 60%)',
        }}
      />

      {/* drifting ember fields */}
      <div
        className="absolute -left-[16vw] top-[10vh] h-[50vw] w-[50vw] animate-blob-morph bg-ember/20 blur-[130px]"
        style={{ opacity: 0.8 * intensity, animationDuration: '19s' }}
      />
      <div
        className="absolute right-[-12vw] top-[34vh] h-[44vw] w-[44vw] animate-blob-morph bg-flame/18 blur-[140px]"
        style={{ opacity: 0.7 * intensity, animationDuration: '25s', animationDelay: '-7s' }}
      />
      <div
        className="absolute bottom-[-18vh] left-[28vw] h-[42vw] w-[42vw] animate-blob-morph bg-amber/14 blur-[150px]"
        style={{ opacity: 0.65 * intensity, animationDuration: '22s', animationDelay: '-13s' }}
      />

      {/* mesh heat haze */}
      <div
        className="absolute inset-0 animate-ember-drift mix-blend-screen"
        style={{
          opacity: 0.34 * intensity,
          background:
            'conic-gradient(from 200deg at 40% 70%, rgba(255,45,70,0.30), rgba(255,176,32,0.16), rgba(255,90,31,0.34), rgba(255,45,70,0.30))',
          filter: 'blur(100px)',
        }}
      />

      {/* survey grid, lit only near the cursor */}
      <div className="grid-lines grid-spotlight absolute inset-0 opacity-70" />

      {/* pointer heat */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(620px circle at var(--mx) var(--my), rgba(255,90,31,0.13), transparent 62%)',
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 100% at 50% 45%, transparent 38%, rgba(10,7,5,0.82) 100%)',
        }}
      />
    </div>
  );
}
