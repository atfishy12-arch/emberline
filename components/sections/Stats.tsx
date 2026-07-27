import Counter from '../ui/Counter';
import ProgressRing from '../ui/ProgressRing';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';

const FIGURES = [
  { to: 24, suffix: '', label: 'Homes on the site, and no more', decimals: 0 },
  { to: 11, suffix: '', label: 'Houses completed since 2020', decimals: 0 },
  { to: 4.6, suffix: ' acres', label: 'Of ridge, half kept as woodland', decimals: 1 },
  { to: 22, suffix: ' months', label: 'Reservation to keys, typical', decimals: 0 },
] as const;

const RINGS = [
  { value: 92, label: 'Airtightness vs. building regs' },
  {
    value: 100,
    label: 'Homes rated EPC A',
    gradient: ['#FFB020', '#FF5A1F'] as [string, string],
  },
  {
    value: 68,
    label: 'Phase Two already reserved',
    gradient: ['#FF2D46', '#FFB020'] as [string, string],
  },
] as const;

export default function Stats() {
  return (
    <section id="numbers" className="relative py-28 sm:py-36 lg:py-44">
      <div className="container">
        <SectionHeading
          eyebrow="The numbers"
          title="Small enough"
          accent="to answer the phone."
          copy="Emberline has built eleven houses in six years. These are all of them, and everything we measure."
        />

        {/* ---------- counters ---------- */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-ash/10 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 100} className="bg-ink/85">
              <div className="group relative h-full overflow-hidden p-8 transition-colors duration-500 hover:bg-ash/[0.04] sm:p-10">
                <span className="pointer-events-none absolute -inset-10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100 [background:radial-gradient(circle_at_center,rgba(255,90,31,0.4),transparent_65%)]" />
                <p className="relative text-4xl font-semibold tracking-tight sm:text-5xl">
                  <Counter to={f.to} decimals={f.decimals} suffix={f.suffix} />
                </p>
                <p className="relative mt-3 text-[13px] leading-relaxed text-faint">{f.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ---------- rings ---------- */}
        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {RINGS.map((r, i) => (
            <Reveal key={r.label} from="scale" delay={i * 150}>
              <div className="glass flex h-full flex-col items-center gap-6 rounded-3xl p-9">
                <ProgressRing
                  value={r.value}
                  label={r.label}
                  delay={i * 130}
                  gradient={'gradient' in r ? r.gradient : undefined}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
