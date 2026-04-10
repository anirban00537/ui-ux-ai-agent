"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { motion } from "framer-motion";
import { 
    IconSparkles, 
    IconBolt, 
    IconBrain, 
    IconPalette,
    IconRocket,
    IconHeart,
    IconTarget,
    IconUsers
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
    const features = [
        {
            icon: IconBolt,
            title: "Ready in Seconds",
            description: "No more all-nighters. Just type your idea, and our AI builds a complete mobile app UI for you instantly.",
        },
        {
            icon: IconBrain,
            title: "Smart Writing",
            description: "Our AI learns from what you type. It writes clear, catchy text that sounds just like a professional.",
        },
        {
            icon: IconPalette,
            title: "Beautiful Designs",
            description: "Say goodbye to ugly UI. Everything is automatically formatted to look stunning and consistent.",
        },
        {
            icon: IconSparkles,
            title: "Easy Editing",
            description: "Want to change something? Just click and type. It's as simple as describing your vision.",
        }
    ];

    const values = [
        {
            icon: IconRocket,
            title: "Innovation First",
            description: "We push boundaries to create tools that feel like magic.",
        },
        {
            icon: IconHeart,
            title: "User Obsessed",
            description: "Every feature is designed with your experience in mind.",
        },
        {
            icon: IconTarget,
            title: "Precision Focused",
            description: "We sweat the details so you don't have to.",
        },
        {
            icon: IconUsers,
            title: "Community Driven",
            description: "Built by creators, for creators who want more.",
        }
    ];

    return (
        <>
            <Navbar />
            <main className="relative min-h-screen bg-[#1f2228]">
                <section className="relative pt-32 pb-24">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 mb-8"
                            >
                                <span className="font-mono text-xs uppercase tracking-[1.4px] text-white">
                                    About Butterfast
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="font-mono text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1] mb-8 text-white"
                            >
                                We believe in simplicity
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="font-sans text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl mx-auto"
                            >
                                The best tools get out of your way. They shouldn&apos;t require a manual.
                                They should just work. That&apos;s the philosophy behind Butterfast.
                            </motion.p>
                        </div>
                    </div>
                </section>

                <section className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="relative order-2 lg:order-1"
                                >
                                    <div className="relative aspect-square max-w-md mx-auto">
                                        <motion.div 
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute top-0 left-0 w-3/4 p-6 border border-white/10 bg-white/[0.03]"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                                                    <IconSparkles size={20} className="text-white" />
                                                </div>
                                                <div className="h-3 w-24 bg-white/10 rounded-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-white/10 rounded-full" />
                                                <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                                                <div className="h-2 w-3/5 bg-white/10 rounded-full" />
                                            </div>
                                        </motion.div>

                                        <motion.div 
                                            animate={{ y: [0, 10, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                            className="absolute bottom-0 right-0 w-3/4 p-6 border border-white/10 bg-white/[0.03]"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                                                    <IconBrain size={20} className="text-white" />
                                                </div>
                                                <div className="h-3 w-20 bg-white/10 rounded-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-white/10 rounded-full" />
                                                <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-8 order-1 lg:order-2"
                                >
                                    <div>
                                        <span className="font-mono text-xs uppercase tracking-[1.4px] text-white/50">Our Mission</span>
                                        <h2 className="font-sans text-4xl md:text-5xl font-light leading-tight text-white mt-4">
                                            Making beautiful mobile app designs accessible to everyone
                                        </h2>
                                    </div>
                                    
                                    <div className="space-y-6 font-sans text-lg text-white/70 leading-relaxed">
                                        <p>
                                            We started Butterfast because we were tired of spending hours designing screens 
                                            instead of focusing on what really matters — the user experience.
                                        </p>
                                        <p>
                                            Our AI-powered platform transforms your raw thoughts into polished, professional 
                                            mobile app designs in seconds. No design skills needed. No formatting headaches.
                                        </p>
                                        <p className="text-white">
                                            Just brilliant mobile designs, effortlessly created.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="font-mono text-xs uppercase tracking-[1.4px] text-white/50"
                            >
                                What We Offer
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="font-sans text-4xl md:text-5xl font-light mt-4 mb-6 text-white"
                            >
                                Experience the difference
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="font-sans text-lg text-white/70"
                            >
                                Every feature is designed to save you time and make your work shine.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative p-8 border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors duration-300"
                                >
                                    <div className="w-14 h-14 border border-white/20 flex items-center justify-center mb-6 group-hover:border-white/40 transition-colors duration-300">
                                        <feature.icon size={28} className="text-white" />
                                    </div>
                                    <h3 className="font-sans text-xl text-white mb-3">{feature.title}</h3>
                                    <p className="font-sans text-white/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="font-mono text-xs uppercase tracking-[1.4px] text-white/50"
                            >
                                Our Values
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="font-sans text-4xl md:text-5xl font-light mt-4 text-white"
                            >
                                What drives us forward
                            </motion.h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {values.map((value, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="text-center group"
                                >
                                    <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto mb-5 group-hover:border-white/20 transition-colors duration-300">
                                        <value.icon size={28} className="text-white" />
                                    </div>
                                    <h3 className="font-sans text-lg text-white mb-2">{value.title}</h3>
                                    <p className="font-sans text-white/50 text-sm leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto text-center border border-white/10 bg-white/[0.03] p-12 md:p-16"
                        >
                            <h2 className="font-sans text-3xl md:text-5xl font-light text-white mb-6">
                                Ready to create something amazing?
                            </h2>
                            <p className="font-sans text-lg text-white/70 mb-8 max-w-xl mx-auto">
                                Join thousands of creators who are already making beautiful mobile app designs with Butterfast.
                            </p>
                            <Link href="/login">
                                <Button className="font-mono">
                                    Get Started Now
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                <FooterSection />
            </main>
        </>
    );
}
