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
    <footer className="bg-[#1f2228] pt-24 pb-12 border-t border-white/10">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-mono text-2xl text-white tracking-tight">
                Butterfast.
              </span>
            </Link>
            <p className="font-sans text-sm text-white/50 leading-relaxed max-w-xs">
              Effortless AI mobile app designs for teams who value design.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-mono text-xs uppercase tracking-[1.4px] text-white/50 mb-4">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <p className="font-sans text-xs text-white/30">
            &copy; {new Date().getFullYear()} Butterfast Inc.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
          </div>
        </div>
      </div>
    </footer>
  );
}
