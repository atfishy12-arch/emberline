import Marquee from '../ui/Marquee';
import SectionHeading from '../ui/SectionHeading';

interface Quote {
  quote: string;
  name: string;
  role: string;
  tint: string;
}

const ROW_ONE: Quote[] = [
  {
    quote:
      'They talked us out of the bigger house. Two years in, they were right — we use every room in this one.',
    name: 'Rachel & Sam Okonjo',
    role: 'Plot 04, The Ridge — moved in 2023',
    tint: 'from-ember to-flame',
  },
  {
    quote:
      'The heating bill for our first winter was less than the standing charge on our old flat. I checked it twice.',
    name: 'Daniel Whitmore',
    role: 'Plot 09, The Kiln — moved in 2024',
    tint: 'from-amber to-ember',
  },
  {
    quote:
      'Our site manager gave us his mobile number on day one and still answers it. That is the whole review.',
    name: 'Priya Nadkarni',
    role: 'Plot 02, The Ridge — moved in 2022',
    tint: 'from-flame to-amber',
  },
];

const ROW_TWO: Quote[] = [
  {
    quote:
      'We had a leak on a Sunday in the first year. Someone was here by eleven. Nobody asked us to fill in a form.',
    name: 'Tom & Elise Barbier',
    role: 'Plot 06, The Ridge — moved in 2023',
    tint: 'from-ember to-amber',
  },
  {
    quote:
      'You notice the light before anything else. In October the whole living room turns gold at about five.',
    name: 'Marcus Feld',
    role: 'Plot 11, The Kiln — moved in 2024',
    tint: 'from-amber to-flame',
  },
  {
    quote:
      'We viewed nine new builds. This was the only one where the person showing us round had actually built it.',
    name: 'Joanna Reyes',
    role: 'Plot 07, The Kiln — reserved 2025',
    tint: 'from-flame to-ember',
  },
];

function QuoteCard({ quote, name, role, tint }: Quote) {
  const initials = name
    .replace(/&.*?\s/, '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <figure
      className="glass group relative flex w-[86vw] max-w-[430px] shrink-0 flex-col justify-between gap-7 rounded-3xl p-8 transition-transform duration-700 hover:-translate-y-1.5 sm:w-[430px]"
      data-cursor="view"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100 [background:radial-gradient(70%_60%_at_50%_0%,rgba(255,90,31,0.20),transparent_70%)]"
      />
      <blockquote className="relative text-[15.5px] leading-relaxed text-ash/85">
        <span className="mr-1 font-display text-3xl italic leading-none text-amber">“</span>
        {quote}
      </blockquote>

      <figcaption className="relative flex items-center gap-3.5">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${tint} text-[13px] font-semibold text-ink`}
        >
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold tracking-tight">{name}</span>
          <span className="block truncate text-[12.5px] text-faint">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  return (
    <section id="residents" className="relative overflow-hidden py-28 sm:py-36 lg:py-44">
      <div className="container">
        <SectionHeading
          eyebrow="Residents"
          title="Eleven families,"
          accent="six winters in."
        />
      </div>

      {/* Two rows travelling in opposite directions — the counter-motion reads
          as depth and keeps the eye moving across the section. */}
      <div className="mt-16 flex flex-col gap-5 sm:mt-20">
        <Marquee speed={56}>
          {ROW_ONE.map((q) => (
            <QuoteCard key={q.name} {...q} />
          ))}
        </Marquee>
        <Marquee speed={66} reverse>
          {ROW_TWO.map((q) => (
            <QuoteCard key={q.name} {...q} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
