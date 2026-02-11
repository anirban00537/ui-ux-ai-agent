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

export default function AboutPage() {
    const features = [
        {
            icon: IconBolt,
            title: "Ready in Seconds",
            description: "No more all-nighters. Just type your idea, and our AI builds a complete mobile app UI for you instantly.",
            gradient: "from-amber-500 to-orange-500"
        },
        {
            icon: IconBrain,
            title: "Smart Writing",
            description: "Our AI learns from what you type. It writes clear, catchy text that sounds just like a professional.",
            gradient: "from-primary to-cyan-500"
        },
        {
            icon: IconPalette,
            title: "Beautiful Designs",
            description: "Say goodbye to ugly UI. Everything is automatically formatted to look stunning and consistent.",
            gradient: "from-pink-500 to-rose-500"
        },
        {
            icon: IconSparkles,
            title: "Easy Editing",
            description: "Want to change something? Just click and type. It's as simple as describing your vision.",
            gradient: "from-violet-500 to-purple-500"
        }
    ];

    const values = [
        {
            icon: IconRocket,
            title: "Innovation First",
            description: "We push boundaries to create tools that feel like magic.",
            color: "text-primary"
        },
        {
            icon: IconHeart,
            title: "User Obsessed",
            description: "Every feature is designed with your experience in mind.",
            color: "text-rose-500"
        },
        {
            icon: IconTarget,
            title: "Precision Focused",
            description: "We sweat the details so you don't have to.",
            color: "text-amber-500"
        },
        {
            icon: IconUsers,
            title: "Community Driven",
            description: "Built by creators, for creators who want more.",
            color: "text-violet-500"
        }
    ];

    return (
        <>
            <Navbar />
            <main className="relative min-h-screen">
                <div>
                    {/* Hero Section */}
                    <section className="relative pt-32 pb-24">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
                            >
                                <IconSparkles size={16} />
                                About Butterfast
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1] mb-8 text-foreground"
                            >
                                We believe in{" "}
                                <span className="relative inline-block">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                                        simplicity
                                    </span>
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 8C50 2 150 2 198 8" stroke="url(#underline-gradient)" strokeWidth="4" strokeLinecap="round"/>
                                        <defs>
                                            <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                                <stop offset="100%" stopColor="hsl(var(--secondary))" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-xl md:text-2xl text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto"
                            >
                                The best tools get out of your way. They shouldn't require a manual.
                                They should just work. That's the philosophy behind Butterfast.
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                {/* Visual Element */}
                                <motion.div
                                    initial={{ opacity: 0, x: -40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="relative order-2 lg:order-1"
                                >
                                    <div className="relative aspect-square max-w-md mx-auto">
                                        {/* Floating mobile screens */}
                                        <motion.div 
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute top-0 left-0 w-3/4 p-6 bg-card rounded-3xl shadow-xl border border-border"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                    <IconSparkles size={20} className="text-white" />
                                                </div>
                                                <div className="h-3 w-24 bg-muted rounded-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-muted rounded-full" />
                                                <div className="h-2 w-4/5 bg-muted rounded-full" />
                                                <div className="h-2 w-3/5 bg-muted rounded-full" />
                                            </div>
                                        </motion.div>

                                        <motion.div 
                                            animate={{ y: [0, 10, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                            className="absolute bottom-0 right-0 w-3/4 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border border-primary/20 backdrop-blur-sm"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center">
                                                    <IconBrain size={20} className="text-primary" />
                                                </div>
                                                <div className="h-3 w-20 bg-primary/20 rounded-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-primary/10 rounded-full" />
                                                <div className="h-2 w-2/3 bg-primary/10 rounded-full" />
                                            </div>
                                        </motion.div>

                                    </div>
                                </motion.div>

                                {/* Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-8 order-1 lg:order-2"
                                >
                                    <div>
                                        <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Mission</span>
                                        <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight text-foreground mt-4">
                                            Making beautiful mobile app designs accessible to everyone
                                        </h2>
                                    </div>
                                    
                                    <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                        <p>
                                            We started Butterfast because we were tired of spending hours designing screens 
                                            instead of focusing on what really matters — the user experience.
                                        </p>
                                        <p>
                                            Our AI-powered platform transforms your raw thoughts into polished, professional 
                                            mobile app designs in seconds. No design skills needed. No formatting headaches.
                                        </p>
                                        <p className="font-medium text-foreground">
                                            Just brilliant mobile designs, effortlessly created.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-primary font-semibold text-sm uppercase tracking-wider"
                            >
                                What We Offer
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="font-serif text-4xl md:text-5xl font-medium mt-4 mb-6"
                            >
                                Experience the difference
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-muted-foreground"
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
                                    className="group relative p-8 rounded-3xl bg-card border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-500"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon size={28} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                    
                                    {/* Hover gradient */}
                                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 relative overflow-hidden">
                    
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-primary font-semibold text-sm uppercase tracking-wider"
                            >
                                Our Values
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="font-serif text-4xl md:text-5xl font-medium mt-4"
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
                                    <div className="w-16 h-16 rounded-2xl bg-card shadow-lg border border-border flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                                        <value.icon size={28} className={value.color} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-foreground">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto text-center rounded-[32px] relative overflow-hidden shadow-2xl"
                        >
                            <div className="relative z-10 bg-card border border-border rounded-[32px] p-12 md:p-16">
                                <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground mb-6">
                                    Ready to create something amazing?
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                                    Join thousands of creators who are already making beautiful mobile app designs with Butterfast.
                                </p>
                                <a 
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-xl"
                                >
                                    <IconSparkles size={20} />
                                    Get Started Now
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                </div>
                <FooterSection />
            </main>
        </>
    );
}
