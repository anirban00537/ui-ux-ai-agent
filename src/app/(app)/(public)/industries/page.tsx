import Link from "next/link";
import { industryTemplates } from "@/lib/seo-data";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { ArrowRight, LayoutTemplate, Sparkles } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Mobile App Design by Industry | Butterfast",
  description: "Browse our collection of AI-generated mobile app designs tailored for e-commerce, fitness, finance, and more. Start building for free.",
  alternates: {
    canonical: "/industries",
  },
  openGraph: {
    title: "AI Mobile App Design by Industry",
    description: "Browse our collection of AI-generated mobile app designs.",
    url: "/industries",
  },
};

export default function IndustriesIndexPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen relative">
        {/* Hero */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <LayoutTemplate size={16} />
                <span>Industries</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-medium text-foreground mb-6">
              App Designs for <br/>
              <span className="text-primary italic">Every Industry</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Don't start from scratch. Choose your industry and let our AI generate a professional, tailored mobile app design in seconds.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="pb-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industryTemplates.map((template) => (
                <Link 
                  key={template.slug} 
                  href={`/industries/${template.slug}`}
                  className="group relative flex flex-col p-8 rounded-3xl bg-card border border-border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="mb-6 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Sparkles size={24} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {template.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 flex-1">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {template.useCases.slice(0, 3).map((useCase) => (
                      <span key={useCase} className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        {useCase}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-primary font-bold text-sm mt-auto group-hover:gap-3 transition-all">
                    <span>Start Building</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}
