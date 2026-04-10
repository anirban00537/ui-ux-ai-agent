"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    action,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6",
                className
            )}
        >
            <div className="space-y-4">
                <h1 className="font-mono text-2xl md:text-4xl text-white tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="font-sans text-sm md:text-base text-white/50 max-w-md">
                        {subtitle}
                    </p>
                )}
            </div>

            {action && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    );
};
