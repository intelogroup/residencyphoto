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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://residencyphoto.com/#website",
        url: "https://residencyphoto.com/",
        name: "ResidencyPhoto",
        description:
          "Resize and compress your photo to exact AAMC ERAS specifications: 2.5 x 3.5 in at 150 DPI, under 150 KB. One upload, one download.",
      },
      {
        "@type": "Product",
        name: "ResidencyPhoto",
        description:
          "ERAS-compliant residency headshot formatting: resize and compress your photo to exact AAMC specifications in one upload.",
        brand: { "@type": "Brand", name: "ResidencyPhoto" },
        image: "https://residencyphoto.com/og-image.jpg",
        offers: {
          "@type": "Offer",
          url: "https://residencyphoto.com/",
          priceCurrency: "USD",
          price: "4",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
