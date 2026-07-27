/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        /* Wildfire: a warm charcoal base so every ember reads as light,
           not as a coloured rectangle. */
        ink: '#0A0705',
        soot: '#140F0B',
        char: '#1E1611',
        ember: {
          DEFAULT: '#FF5A1F',
          soft: '#FF8A4C',
          deep: '#D93A0B',
        },
        flame: {
          DEFAULT: '#FF2D46',
          soft: '#FF6478',
        },
        amber: {
          DEFAULT: '#FFB020',
          soft: '#FFD07A',
        },
        ash: {
          DEFAULT: '#FFF1E4',
          dim: 'rgba(255,241,228,0.60)',
          faint: 'rgba(255,241,228,0.38)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-sm': ['clamp(2.5rem, 7vw, 4.25rem)', { lineHeight: '1.0', letterSpacing: '-0.035em' }],
        display: ['clamp(3rem, 9vw, 7rem)', { lineHeight: '0.93', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(3.5rem, 12vw, 10rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
      },
      boxShadow: {
        glass:
          '0 1px 0 0 rgba(255,235,215,0.14) inset, 0 -1px 0 0 rgba(0,0,0,0.35) inset, 0 30px 70px -30px rgba(0,0,0,0.9)',
        neu: '12px 12px 34px rgba(4,2,1,0.85), -8px -8px 30px rgba(255,90,31,0.06)',
        ember: '0 0 0 1px rgba(255,90,31,0.35), 0 26px 70px -22px rgba(255,90,31,0.7)',
        heat: '0 20px 80px -20px rgba(255,45,70,0.55)',
      },
      transitionTimingFunction: {
        physics: 'cubic-bezier(0.16, 1, 0.3, 1)',
        swift: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        'ember-drift': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(5%, -7%, 0) scale(1.16)' },
          '66%': { transform: 'translate3d(-6%, 5%, 0) scale(0.9)' },
        },
        'blob-morph': {
          '0%,100%': { borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%' },
          '34%': { borderRadius: '68% 32% 37% 63% / 62% 33% 67% 38%' },
          '67%': { borderRadius: '31% 69% 57% 43% / 56% 62% 38% 44%' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'gradient-pan': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'scroll-hint': {
          '0%': { transform: 'translateY(-100%)' },
          '55%,100%': { transform: 'translateY(400%)' },
        },
        /* Heat shimmer for the hero horizon line. */
        flicker: {
          '0%,100%': { opacity: '0.85' },
          '18%': { opacity: '1' },
          '42%': { opacity: '0.72' },
          '61%': { opacity: '0.96' },
          '83%': { opacity: '0.8' },
        },
      },
      animation: {
        'ember-drift': 'ember-drift 24s ease-in-out infinite',
        'blob-morph': 'blob-morph 16s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
        marquee: 'marquee 42s linear infinite',
        'spin-slow': 'spin-slow 26s linear infinite',
        shimmer: 'shimmer 2.6s ease-in-out infinite',
        flicker: 'flicker 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
