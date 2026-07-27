import { Nav } from "./_components/landing/Nav";
import { Hero } from "./_components/landing/Hero";
import { Stats } from "./_components/landing/Stats";
import { HowItWorks } from "./_components/landing/HowItWorks";
import { Features } from "./_components/landing/Features";
import { Pricing } from "./_components/landing/Pricing";
import { Footer } from "./_components/landing/Footer";
import { BackgroundEffect } from "./_components/landing/BackgroundEffect";
import { ErasDeadlineCountdown } from "./_components/landing/ErasDeadlineCountdown";

export default function HomePage() {
  return (
    <main id="main-content">
      <BackgroundEffect />
      <Nav />
      <ErasDeadlineCountdown />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
