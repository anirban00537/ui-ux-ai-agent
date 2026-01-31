"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconCalendar,
  IconLayout2,
} from "@tabler/icons-react";
import { trackEvent } from "@/components/analytics/trackEvent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Design } from "@/services/designs";

interface DesignCardProps {
  design: Design;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const DesignCard: React.FC<DesignCardProps> = ({
  design,
  index,
  onEdit,
  onDelete,
}) => {
  const screenCount = design.screens?.length ?? 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative"
    >
      <Link
        href={`/designs/${design.id}`}
        onClick={() =>
          trackEvent("card_click", "engagement", `design_${design.id}`)
        }
      >
        <div className="relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer bg-card border border-border hover:border-primary/20 hover:shadow-depth-3 p-4 min-h-[140px] flex flex-col">
          <h3 className="font-serif text-sm font-bold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug min-h-[2.8em]">
            {design.title || "Untitled Design"}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconLayout2 size={12} />
              {screenCount} {screenCount === 1 ? "screen" : "screens"}
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar size={12} />
              {formatDate(design.updatedAt || design.createdAt)}
            </span>
            <span className="text-muted-foreground/80">
              {formatTime(design.updatedAt || design.createdAt)}
            </span>
          </div>
        </div>
      </Link>

      {/* Actions dropdown */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-sm hover:bg-card transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <IconDotsVertical size={16} className="text-foreground/70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border border-border shadow-lg bg-card backdrop-blur-md"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                trackEvent("card_action_edit", "engagement", `design_${design.id}`);
                onEdit(design.id);
              }}
              className="rounded-lg cursor-pointer"
            >
              <IconEdit className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                trackEvent("card_action_delete", "engagement", `design_${design.id}`);
                onDelete(design.id, design.title || "Untitled Design");
              }}
              className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
            >
              <IconTrash className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
