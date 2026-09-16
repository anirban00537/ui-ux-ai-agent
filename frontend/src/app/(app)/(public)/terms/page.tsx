"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main className="relative min-h-screen">
                <div>
                    <section className="pt-32 pb-24">
                        <div className="container mx-auto px-4">
                            <div className="max-w-3xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-12 md:p-16 rounded-[40px] bg-white border border-slate-100 shadow-2xl"
                                >
                                    <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-8">Terms of Service</h1>
                                    <p className="text-muted-foreground mb-12">Last updated: January 16, 2026</p>

                                    <div className="prose prose-slate max-w-none space-y-8">
                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                By accessing or using Butterfast, you agree to be bound by these Terms of Service. 
                                                If you do not agree to these terms, please do not use our service.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Butterfast provides an AI-powered mobile app design platform. 
                                                We reserve the right to modify or discontinue any part of the service at any time.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                You are responsible for all content you create using Butterfast. 
                                                You agree not to use the service for any illegal or unauthorized purpose.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">4. Intellectual Property</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                You retain all rights to the content you create. Butterfast retains all rights to the 
                                                platform, tools, and branding.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">5. Limitation of Liability</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Butterfast is provided "as is". We are not liable for any damages resulting from 
                                                the use or inability to use our service.
                                            </p>
                                        </section>

                                        <section>
                                            <h2 className="text-2xl font-bold text-foreground mb-4">6. Governing Law</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                These terms are governed by the laws of the State of California.
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
