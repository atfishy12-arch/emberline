import Reveal from './Reveal';
import SplitReveal from './SplitReveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  copy?: string;
  align?: 'center' | 'left';
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  accent,
  copy,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center';

  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      {eyebrow && (
        <Reveal from="down" duration={620}>
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_12px_2px_rgba(255,176,32,0.9)]" />
            {eyebrow}
          </span>
        </Reveal>
      )}

      <h2 className="mt-6 max-w-[20ch] text-display-sm font-semibold">
        <SplitReveal text={title} />
        {accent && (
          <>
            <br />
            <SplitReveal
              text={accent}
              delay={120}
              className="gradient-text font-display font-normal italic"
            />
          </>
        )}
      </h2>

      {copy && (
        <Reveal delay={180} className={align === 'left' ? '' : 'mx-auto'}>
          <p className="mt-6 max-w-[54ch] text-base leading-relaxed text-dim sm:text-lg">{copy}</p>
        </Reveal>
      )}
    </div>
  );
}
