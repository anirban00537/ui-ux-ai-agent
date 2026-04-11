"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  iconClassName?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  iconClassName,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-20 px-8 text-center bg-background", className)}
    >
      <motion.div
        className="relative w-24 h-24 border border-border flex items-center justify-center mb-8"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon size={42} className={cn("text-muted-foreground", iconClassName)} />
      </motion.div>
      <h3 className="font-sans text-xl text-foreground mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-muted-foreground mb-8 text-center max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="font-mono"
        >
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};
