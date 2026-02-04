"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Industries", href: "/industries" },
  ],
  company: [
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

export function FooterSection() {
  return (
    <footer className="bg-background pt-24 pb-12 overflow-hidden border-t border-border">
      {/* Butter Wash Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-secondary/30 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Butterfast.
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Effortless AI mobile app designs for teams who value design.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
             {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                   <h3 className="font-serif text-foreground font-semibold mb-4 capitalize">{category}</h3>
                   <ul className="space-y-3">
                      {links.map((link) => (
                         <li key={link.name}>
                            <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                               {link.name}
                            </Link>
                         </li>
                      ))}
                   </ul>
                </div>
             ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-secondary/10">
           <p className="text-xs text-muted-foreground">
             &copy; {new Date().getFullYear()} Butterfast Inc.
           </p>
           <div className="flex items-center gap-6 mt-4 md:mt-0">
              {/* Socials could go here */}
           </div>
        </div>
      </div>
    </footer>
  );
}
