"use client";

import { IconLayoutDashboard, IconWand, IconFileText, IconPalette, IconTypography, IconCheck } from "@tabler/icons-react";

const features = [
  {
    title: "Smart Layouts",
    description: "Don't stress about where to put things. Our AI arranges your interface perfectly, every time.",
    icon: <IconLayoutDashboard className="w-6 h-6 text-primary" />,
  },
  {
    title: "Instant Transformation",
    description: "Turn your concepts or sketches into a fresh mobile design in just one click.",
    icon: <IconWand className="w-6 h-6 text-primary" />,
  },
  {
    title: "Instant Prototype",
    description: "Preview your app seamlessly right from your browser. Your audience sees the flow instantly.",
    icon: <IconFileText className="w-6 h-6 text-primary" />,
  },
  {
    title: "Your Brand",
    description: "Upload your logo and colors once. We'll make sure every design looks like you.",
    icon: <IconPalette className="w-6 h-6 text-primary" />,
  },
  {
    title: "Beautiful Text",
    description: "We pick the best fonts so your words are easy to read and look great.",
    icon: <IconTypography className="w-6 h-6 text-primary" />,
  },
  {
    title: "Perfect Colors",
    description: "Colors that match and look professional, chosen automatically for you.",
    icon: <IconCheck className="w-6 h-6 text-primary" />,
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden" id="features">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section - Inspired by PricingSection */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-primary/70"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-foreground/70">
              Powerful Capabilities
            </span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight leading-[1.1]">
            Everything you need, <br />
            <span className="italic text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">nothing you don't.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A complete suite of design tools designed to eliminate the friction between your ideas and a finished mobile app design.
          </p>
        </div>

        {/* Features Grid - Clean & Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-secondary/10 group-hover:bg-primary/10 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-3 font-medium">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
