"use client";

import { IconLayoutDashboard, IconWand, IconFileText, IconPalette, IconTypography, IconCheck } from "@tabler/icons-react";
import { Sparkles } from "lucide-react";

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
    <section className="py-32 relative overflow-hidden bg-muted/50" id="features">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 flex flex-col items-center">
          <h2 className="text-5xl md:text-[64px] font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Everything you need <br />
            <span className="flex items-center justify-center gap-3">
              nothing you don't <Sparkles className="w-10 h-10 text-primary" />
            </span>
          </h2>
          <p className="text-xl md:text-[22px] text-muted-foreground/90 font-medium leading-relaxed max-w-2xl mx-auto">
            A complete suite of design tools designed to eliminate the friction between your ideas and a finished mobile app design.
          </p>
        </div>

        {/* Features Grid - Clean & Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-10 rounded-[32px] bg-white border border-border/50 shadow-sm transition-all duration-500 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-8 inline-flex p-4 rounded-2xl bg-primary/10 text-primary shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-[22px] text-foreground mb-4 font-bold tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground/90 text-[17px] leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
