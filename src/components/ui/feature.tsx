"use client";

import { IconLayoutDashboard, IconWand, IconFileText, IconPalette, IconTypography, IconCheck } from "@tabler/icons-react";

const features = [
  {
    title: "Smart Layouts",
    description: "Don't stress about where to put things. Our AI arranges your interface perfectly, every time.",
    icon: <IconLayoutDashboard className="w-6 h-6 text-white" />,
  },
  {
    title: "Instant Transformation",
    description: "Turn your concepts or sketches into a fresh mobile design in just one click.",
    icon: <IconWand className="w-6 h-6 text-white" />,
  },
  {
    title: "Instant Prototype",
    description: "Preview your app seamlessly right from your browser. Your audience sees the flow instantly.",
    icon: <IconFileText className="w-6 h-6 text-white" />,
  },
  {
    title: "Your Brand",
    description: "Upload your logo and colors once. We'll make sure every design looks like you.",
    icon: <IconPalette className="w-6 h-6 text-white" />,
  },
  {
    title: "Beautiful Text",
    description: "We pick the best fonts so your words are easy to read and look great.",
    icon: <IconTypography className="w-6 h-6 text-white" />,
  },
  {
    title: "Perfect Colors",
    description: "Colors that match and look professional, chosen automatically for you.",
    icon: <IconCheck className="w-6 h-6 text-white" />,
  }
];

export function FeaturesSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#1f2228]" id="features">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20 flex flex-col items-center">
          <h2 className="font-mono text-5xl md:text-[64px] text-white mb-6 leading-[1.1] tracking-tight">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="font-sans text-xl md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            A complete suite of design tools designed to eliminate the friction between your ideas and a finished mobile app design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-10 border border-white/10 bg-white/[0.03] transition-colors duration-500 hover:border-white/20"
            >
              <div className="mb-8 inline-flex p-4 border border-white/20">
                {feature.icon}
              </div>
              <h3 className="font-sans text-[22px] text-white mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="font-sans text-white/60 text-[17px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
