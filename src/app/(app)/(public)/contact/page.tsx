"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { IconMail, IconMessage, IconMapPin, IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { createInquiry } from "@/services/contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setIsLoading(true);
            await createInquiry(formData);
            toast.success("Message sent! We'll get back to you soon.");
            setFormData({
                name: "",
                email: "",
                subject: "General Inquiry",
                message: ""
            });
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || "Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            { "@type": "Question", "name": "Is there a free trial?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! You can start for free and create up to 3 designs without a credit card." }},
            { "@type": "Question", "name": "Can I export my designs?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. You can export to clean React code, HTML/CSS, or high-res PNG." }},
            { "@type": "Question", "name": "Do you offer team billing?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we have enterprise and team plans with centralized billing and collaborative features." }}
        ]
    };

    return (
        <>
            <Navbar />
            <main className="relative min-h-screen bg-[#1f2228]">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
                
                <div className="container mx-auto px-4 pt-24 pb-4">
                    <nav className="flex font-sans text-sm text-white/50" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-2">
                            <li className="inline-flex items-center">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li className="flex items-center">
                                <span className="mx-2">/</span>
                                <span className="text-white font-medium">Contact</span>
                            </li>
                        </ol>
                    </nav>
                </div>
                
                <section className="pt-8 pb-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 mb-8"
                                >
                                    <IconMessage size={16} className="text-white" />
                                    <span className="font-mono text-xs uppercase tracking-[1.4px] text-white">Get in Touch</span>
                                </motion.div>
                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="font-mono text-5xl md:text-7xl font-light tracking-tight text-white mb-6"
                                >
                                    We&apos;d love to hear from you
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="font-sans text-xl text-white/70 max-w-2xl mx-auto"
                                >
                                    Have a question about Butterfast? Interested in a demo? 
                                    Or just want to say hello? Drop us a message below.
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                                <div className="space-y-8">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-8 border border-white/10 bg-white/[0.03]"
                                    >
                                        <div className="space-y-8">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 border border-white/20 flex items-center justify-center shrink-0">
                                                    <IconMail className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-sans text-lg text-white mb-1">Email Us</h3>
                                                    <p className="font-sans text-white/50">hello@butterfast.com</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 border border-white/20 flex items-center justify-center shrink-0">
                                                    <IconMapPin className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-sans text-lg text-white mb-1">Office</h3>
                                                    <p className="font-sans text-white/50">San Francisco, CA</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-white/10">
                                            <p className="font-sans text-sm text-white/50 mb-4">Follow us</p>
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors cursor-pointer">𝕏</div>
                                                <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors cursor-pointer">in</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-2 p-8 md:p-12 border border-white/10 bg-white/[0.03]"
                                >
                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input 
                                                    type="text" 
                                                    placeholder="Jane Doe"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input 
                                                    type="email" 
                                                    placeholder="jane@example.com"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Subject</Label>
                                            <select 
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="flex h-11 w-full border border-white/20 bg-transparent px-4 py-2 font-sans text-sm text-white transition-colors focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-[rgb(59,130,246/0.5)] focus:ring-offset-2 focus:ring-offset-[#1f2228]"
                                            >
                                                <option className="bg-[#1f2228]">General Inquiry</option>
                                                <option className="bg-[#1f2228]">Support Request</option>
                                                <option className="bg-[#1f2228]">Sales & Partnerships</option>
                                                <option className="bg-[#1f2228]">Feature Request</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Message</Label>
                                            <textarea 
                                                rows={5}
                                                placeholder="How can we help?"
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="flex w-full border border-white/20 bg-transparent px-4 py-3 font-sans text-sm text-white transition-colors focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-[rgb(59,130,246/0.5)] focus:ring-offset-2 focus:ring-offset-[#1f2228] resize-none"
                                            />
                                        </div>
                                        <Button 
                                            disabled={isLoading}
                                            className="w-full font-mono"
                                        >
                                            {isLoading ? (
                                                "Sending..."
                                            ) : (
                                                <>
                                                    <IconSend size={20} />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 border-t border-white/10">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="font-sans text-3xl md:text-4xl font-light mb-12 text-white">Frequently Asked Questions</h2>
                            <div className="space-y-4 text-left">
                                {[
                                    { q: "Is there a free trial?", a: "Yes! You can start for free and create up to 3 designs without a credit card." },
                                    { q: "Can I export my designs?", a: "Absolutely. You can export to clean React code, HTML/CSS, or high-res PNG." },
                                    { q: "Do you offer team billing?", a: "Yes, we have enterprise and team plans with centralized billing and collaborative features." }
                                ].map((faq, i) => (
                                    <div key={i} className="p-6 border border-white/10 bg-white/[0.03]">
                                        <h3 className="font-sans text-lg text-white mb-2">{faq.q}</h3>
                                        <p className="font-sans text-white/70">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <FooterSection />
            </main>
        </>
    );
}
