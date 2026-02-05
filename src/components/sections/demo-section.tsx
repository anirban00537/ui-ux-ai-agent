export function DemoSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            <span className="text-xs font-medium tracking-widest uppercase text-white/70">
              Instant Generation
            </span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight leading-[1.1]">
            From text to app, <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">
              in strictly seconds.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-light">
             Watch how simple it is to generate stunning, production-ready designs with just a single text prompt.
          </p>
        </div>
        
        <div className="relative mx-auto max-w-6xl">
          {/* Main Frame */}
          <div className="relative rounded-2xl md:rounded-3xl border border-border/40 bg-card p-2 md:p-3 shadow-2xl">
            <div className="group relative overflow-hidden rounded-xl md:rounded-2xl border border-border/20 bg-muted shadow-sm">
              <div className="relative w-full aspect-video overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/OmrXVvhJt_I?autoplay=1&mute=1&loop=1&playlist=OmrXVvhJt_I&controls=0&rel=0&modestbranding=1&playsinline=1"
                  title="Butterfast Demo"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-105"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              
              {/* Border Ring */}
              <div className="absolute inset-0 pointer-events-none rounded-xl md:rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
