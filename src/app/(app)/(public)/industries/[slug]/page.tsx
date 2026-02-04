import { industryTemplates } from "@/lib/seo-data";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { PromptBox } from "@/components/ui/prompt-input";
import { Check, Sparkles, Zap, ArrowLeft, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = industryTemplates.find((t) => t.slug === slug);

  if (!template) {
    return {
      title: "Industry Not Found",
    };
  }

  return {
    title: `${template.title} - AI Mobile App Generator`,
    description: template.metaDescription,
    alternates: {
      canonical: `/industries/${slug}`,
    },
    openGraph: {
      title: template.title,
      description: template.metaDescription,
      url: `/industries/${slug}`,
    },
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const template = industryTemplates.find((t) => t.slug === slug);

  if (!template) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center opacity-5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative z-10">
          <div className="container mx-auto max-w-5xl text-center">
            
            <Link href="/industries" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm font-medium">
              <ArrowLeft size={16} />
              Back to all industries
            </Link>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
               <Sparkles size={16} />
               <span>AI-Powered Generator</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              {template.heroTitle}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {template.heroSubtitle}
            </p>

            {/* Prompt Box Area */}
            <div className="max-w-2xl mx-auto mb-16 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[26px] opacity-20 group-hover:opacity-40 blur-lg transition duration-500" />
              <PromptBox 
                name="template-prompt"
                defaultValue={template.promptExample}
                className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl relative"
              />
              <p className="text-sm text-muted-foreground mt-4">
                <Zap className="inline-block w-3 h-3 text-yellow-500 mr-1" />
                Click send to generate this app instantly
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-card/50 border-y border-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-medium mb-4">Why use our <span className="text-primary">{template.title}</span>?</h2>
              <p className="text-muted-foreground">Everything you need to build a professional app in this space.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {template.features.map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all hover:-translate-y-1 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Check size={20} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature}</h3>
                  <p className="text-sm text-muted-foreground">Optimized for {template.slug} apps.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
             <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[40px] p-12 border border-white/10 text-center">
                <h2 className="text-3xl font-serif font-medium mb-8">Perfect for</h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {template.useCases.map((useCase) => (
                    <span key={useCase} className="px-6 py-3 rounded-full bg-background border border-border shadow-sm text-lg font-medium text-foreground">
                      {useCase}
                    </span>
                  ))}
                </div>
             </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}
