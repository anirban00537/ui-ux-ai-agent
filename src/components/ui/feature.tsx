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
    <section className="py-32 relative" id="features">
      {/* Torch Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1200px] pointer-events-none z-0">
        {/* Core spotlight beam - Increased intensity */}
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[100px] opacity-[0.3]" />
        {/* Secondary glow - Wider spread */}
        <div className="absolute inset-0 h-[800px] -top-[100px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[80px] opacity-[0.2]" />
        {/* Center hot spot - Brightest point */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-[400px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[50px] opacity-[0.4]" />
      </div>

      {/* Torch Light Effect - Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1200px] pointer-events-none z-0">
        {/* Core spotlight beam */}
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[100px] opacity-[0.3]" />
        {/* Secondary glow */}
        <div className="absolute inset-0 h-[800px] -bottom-[100px] bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[80px] opacity-[0.2]" />
        {/* Center hot spot */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-[400px] bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[50px] opacity-[0.4]" />
      </div>


      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            <span className="text-xs font-medium tracking-widest uppercase text-white/70">
              Powerful Capabilities
            </span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight leading-[1.1]">
            Everything you need, <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">
              nothing you don't.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light">
            A complete suite of design tools designed to eliminate the friction between your ideas and a finished mobile app design.
          </p>
        </div>

        {/* Features Grid - Clean & Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-black/20 backdrop-blur-sm border-3d transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02]"
            >
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/5 border-3d text-primary group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-3 font-medium group-hover:text-white transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
