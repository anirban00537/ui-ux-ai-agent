"use client";

import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GridSkeletonProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  aspectRatio?: "square" | "video" | "portrait";
}

export const GridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 10,
  className,
  itemClassName,
  aspectRatio = "square",
}) => (
  <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.05 }}
        className={cn(
          "rounded-2xl overflow-hidden bg-card border border-border shadow-sm",
          itemClassName
        )}
      >
        <Skeleton 
          className={cn(
            "w-full", 
            aspectRatio === "square" ? "aspect-square" : 
            aspectRatio === "video" ? "aspect-video" : "aspect-[3/4]"
          )} 
        />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>
      </motion.div>
    ))}
  </div>
);

interface PageSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ className, children }) => (
  <div className={cn("w-full space-y-8 animate-pulse", className)}>
    {children || (
      <>
        <Skeleton className="h-12 w-1/3 rounded-2xl border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-[32px] border border-border shadow-sm" />
          <Skeleton className="h-64 rounded-[32px] border border-border shadow-sm" />
        </div>
      </>
    )}
  </div>
);
