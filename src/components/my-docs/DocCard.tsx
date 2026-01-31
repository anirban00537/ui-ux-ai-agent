"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconFileText,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconCalendar,
  IconStack2,
} from "@tabler/icons-react";
import { trackEvent } from "@/components/analytics/trackEvent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_THEME, Theme } from "@/store/slices/cardsSlice";
import { CardPreview } from "./CardPreview";

interface DocCardProps {
  doc: any;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const DocCard: React.FC<DocCardProps> = ({
  doc,
  index,
  onEdit,
  onDelete,
}) => {
  const theme: Theme = {
    ...DEFAULT_THEME,
    ...(doc.globalTheme || {}),
  };
  
  const firstCard = doc.cards?.[0];
  const cardCount = doc._count?.cards || doc.cards?.length || 0;
  
  // Check if cards have actual presentation data (rows/blocks), not just outline
  const hasActualPresentation = doc?.cards?.some((card: any) => 
    card.data?.rows && card.data.rows.length > 0
  );
  
  // Determine the correct route based on whether doc has presentation data
  const docHref = hasActualPresentation ? `/docs/${doc.id}` : `/create/outline/${doc.id}`;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative"
    >
      <Link 
        href={docHref}
        onClick={() => trackEvent('card_click', 'engagement', `doc_${doc.id}`)}
      >
        <div 
          className="relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer bg-card border border-border hover:border-primary/20 hover:shadow-depth-3"
        >
          {/* Card Preview */}
          <div className="relative border-b border-black/5">
            {firstCard ? (
              <CardPreview card={firstCard} theme={theme} />
            ) : (
              <div 
                className="aspect-video flex items-center justify-center bg-secondary/5"
              >
                <IconFileText size={48} className="text-secondary/50" />
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
          </div>

          {/* Content */}
          <div className="relative p-4 z-10">
            <h3 className="font-serif text-sm font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {doc.title || "Untitled Doc"}
            </h3>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5 p-1 px-2 rounded-full bg-secondary/10">
                <IconStack2 size={12} />
                {cardCount}
              </span>
              <span className="flex items-center gap-1.5">
                <IconCalendar size={12} />
                {formatDate(doc.updatedAt || doc.createdAt)}
              </span>
            </div>
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
                trackEvent('card_action_edit', 'engagement', `doc_${doc.id}`);
                onEdit(doc.id);
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
                trackEvent('card_action_delete', 'engagement', `doc_${doc.id}`);
                onDelete(doc.id, doc.title || "Untitled Doc");
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
