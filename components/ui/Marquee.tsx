import type { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full pass. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Infinite marquee. The track holds its children twice and translates -50%,
 * so the loop is seamless with zero JS running per frame — this is one of the
 * few places where CSS beats an animation library outright.
 */
export default function Marquee({
  children,
  speed = 42,
  reverse = false,
  className = '',
}: MarqueeProps) {
  const track = <div className="flex shrink-0 items-stretch gap-6 pr-6">{children}</div>;

  return (
    <div className={`mask-fade-x group relative overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee [animation-play-state:running] group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {track}
        {track}
      </div>
    </div>
  );
}
