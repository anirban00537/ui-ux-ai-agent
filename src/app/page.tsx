import { Navbar } from "@/components/navbar";
import HeroSection from "@/components/ui/hero-section";
import { FeaturesSection } from "@/components/ui/feature";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CTASection } from "@/components/sections/cta-section";
import { FooterSection } from "@/components/sections/footer-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen h-full w-full bg-background">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <FooterSection />
      </main>
    </>
  );
}
