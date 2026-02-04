"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { TablerIcon } from "@tabler/icons-react";

interface SuggestionCardProps {
  icon: LucideIcon | TablerIcon | any;
  title: string;
  description: string;
  prompt: string;
  iconColor?: string;
  onClick: (prompt: string) => void;
  index?: number;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  prompt, 
  iconColor, 
  onClick,
  index = 0
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(prompt)}
      className="group relative flex flex-col items-start gap-4 p-5 bg-card/40 backdrop-blur-md rounded-2xl text-left transition-all duration-500 border border-border/10 hover:border-primary/30 hover:bg-card/60 hover:shadow-2xl h-full w-full overflow-hidden"
    >
      <div 
        className={cn(
          "relative p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 bg-primary/5 text-primary",
          iconColor
        )}
      >
        <Icon size={20} className="stroke-[1.5] opacity-90 group-hover:opacity-100" />
      </div>
      
      <div className="flex-1 w-full space-y-1.5 ">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.button>
  );
};
