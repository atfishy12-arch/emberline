import Ember from '@/components/ui/Ember';
import Scene from '@/components/ui/Scene';
import CursorGlow from '@/components/chrome/CursorGlow';
import Navbar from '@/components/chrome/Navbar';
import Preloader from '@/components/chrome/Preloader';
import Ripple from '@/components/chrome/Ripple';
import ScrollProgress from '@/components/chrome/ScrollProgress';
import ScrollToTop from '@/components/chrome/ScrollToTop';
import SmoothScroll from '@/components/chrome/SmoothScroll';

import Hero from '@/components/sections/Hero';
import Proof from '@/components/sections/Proof';
import About from '@/components/sections/About';
import Statement from '@/components/sections/Statement';
import Collection from '@/components/sections/Collection';
import Board from '@/components/sections/Board';
import Features from '@/components/sections/Features';
import Showcase from '@/components/sections/Showcase';
import Timeline from '@/components/sections/Timeline';
import Stats from '@/components/sections/Stats';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import Faq from '@/components/sections/Faq';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

/**
 * `Scene` gives a section a scroll-scrubbed exit so the next one arrives over
 * it. Deliberately *not* applied to About, Collection, Timeline or FAQ: those
 * rely on `position: sticky`, and a transformed ancestor becomes the sticky
 * containing block, which would change where they pin.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <Preloader />

      {/* fixed atmosphere + chrome */}
      <Ember />
      <div className="noise" aria-hidden />
      <CursorGlow />
      <Ripple />
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />

      <main id="main">
        <Hero />
        <Proof />
        <About />
        <Statement />
        <Collection />
        <Scene>
          <Features />
        </Scene>
        <Scene>
          <Showcase />
        </Scene>
        <Timeline />
        <Board />
        <Scene>
          <Stats />
        </Scene>
        <Scene depth={0.96}>
          <Testimonials />
        </Scene>
        <Scene>
          <Pricing />
        </Scene>
        <Faq />
        <Scene depth={0.97}>
          <Contact />
        </Scene>
      </main>

      <Footer />
    </SmoothScroll>
  );
}
