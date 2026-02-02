"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="relative min-h-screen overflow-auto bg-background">
                <div>
                    <section className="pt-32 pb-24">
                        <div className="container mx-auto px-4">
                            <div className="max-w-3xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-12 md:p-16 rounded-[40px] bg-white border border-slate-100 shadow-2xl"
                                >
                                    <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-8">Privacy Policy</h1>
                                    <p className="text-muted-foreground mb-12">Last updated: January 16, 2026</p>

                                    <div className="prose prose-slate max-w-none space-y-8">
                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Welcome to Butterfast. We value your privacy and are committed to protecting your personal data. 
                                                This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                                            <p className="text-muted-foreground leading-relaxed mb-4">
                                                We collect information that you provide directly to us when you:
                                            </p>
                                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                                <li>Create an account or profile</li>
                                                <li>Use our AI design generation services</li>
                                                <li>Communicate with us via email or support</li>
                                                <li>Subscribe to our newsletters or premium plans</li>
                                            </ul>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use AI</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Butterfast uses artificial intelligence to help generate and structure content. 
                                                Your input data is used to process your requests. We do not use your private designs 
                                                 to train public models without your explicit consent.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                We implement industry-standard security measures to protect your data. 
                                                All designs are encrypted at rest and during transmission.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">5. Contact Us</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                If you have any questions about this Privacy Policy, please contact us at 
                                                <a href="mailto:privacy@butterfast.com" className="text-primary font-medium ml-1">privacy@butterfast.com</a>.
                                            </p>
                                        </section>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </div>
                <FooterSection />
            </main>
        </>
    );
}
