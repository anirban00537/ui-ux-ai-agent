"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { IconMail, IconMessage, IconMapPin, IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { createInquiry } from "@/services/contact";

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
        } catch (error: any) {
            toast.error(error.message || "Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="relative min-h-screen overflow-auto bg-background">
                <div>
                    <section className="pt-32 pb-24">
                        <div className="container mx-auto px-4">
                            <div className="max-w-5xl mx-auto">
                                <div className="text-center mb-16">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
                                    >
                                        <IconMessage size={16} />
                                        Get in Touch
                                    </motion.div>
                                    <motion.h1 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="font-serif text-5xl md:text-7xl font-medium tracking-tight text-foreground mb-6"
                                    >
                                        We'd love to hear <br />
                                        <span className="text-primary italic">from you</span>
                                    </motion.h1>
                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl text-muted-foreground max-w-2xl mx-auto"
                                    >
                                        Have a question about Butterfast? Interested in a demo? 
                                        Or just want to say hello? Drop us a message below.
                                    </motion.p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                                    {/* Contact Info */}
                                    <div className="space-y-8">
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl"
                                        >
                                            <div className="space-y-8">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                        <IconMail className="text-primary" size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                                        <p className="text-muted-foreground">hello@butterfast.com</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                                                        <IconMapPin className="text-secondary" size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-1">Office</h3>
                                                        <p className="text-muted-foreground">San Francisco, CA</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-12 pt-8 border-t border-slate-100">
                                                <p className="text-sm font-medium text-foreground mb-4">Follow us</p>
                                                <div className="flex gap-4">
                                                    {/* Social icons placeholders */}
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">𝕏</div>
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">in</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Contact Form */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="lg:col-span-2 p-8 md:p-12 rounded-3xl bg-white border border-slate-100 shadow-2xl"
                                    >
                                        <form className="space-y-6" onSubmit={handleSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold ml-1">Name</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Jane Doe"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold ml-1">Email</label>
                                                    <input 
                                                        type="email" 
                                                        placeholder="jane@example.com"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold ml-1">Subject</label>
                                                <select 
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                                                >
                                                    <option>General Inquiry</option>
                                                    <option>Support Request</option>
                                                    <option>Sales & Partnerships</option>
                                                    <option>Feature Request</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold ml-1">Message</label>
                                                <textarea 
                                                    rows={5}
                                                    placeholder="How can we help?"
                                                    required
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                                ></textarea>
                                            </div>
                                            <Button 
                                                disabled={isLoading}
                                                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-coral-glow hover:scale-[1.02] transition-all flex gap-2"
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

                    {/* FAQ Mini Section */}
                    <section className="py-24 bg-white/40 backdrop-blur-sm">
                        <div className="container mx-auto px-4">
                            <div className="max-w-3xl mx-auto text-center">
                                <h2 className="font-serif text-3xl md:text-4xl font-medium mb-12">Frequently Asked Questions</h2>
                                <div className="space-y-4 text-left">
                                    {[
                                        { q: "Is there a free trial?", a: "Yes! You can start for free and create up to 3 designs without a credit card." },
                                        { q: "Can I export my designs?", a: "Absolutely. You can export to clean React code, HTML/CSS, or high-res PNG." },
                                        { q: "Do you offer team billing?", a: "Yes, we have enterprise and team plans with centralized billing and collaborative features." }
                                    ].map((faq, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                            <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                                            <p className="text-muted-foreground">{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <FooterSection />
            </main>
        </>
    );
}
