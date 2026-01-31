"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/components/analytics/trackEvent";

export type CategoryFilter = "all" | "recent" | "favorites";

interface MediaFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
}

const categories: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Recent", value: "recent" },
  { label: "Favorites", value: "favorites" },
];

export const MediaFilters: React.FC<MediaFiltersProps> = ({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
}) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col sm:flex-row gap-4"
    >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
        <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-xl h-11 bg-card border border-border focus:bg-card transition-all shadow-sm"
        />
        {searchQuery && (
            <button
            onClick={() => {
              trackEvent('media_search_clear', 'engagement', 'library');
              onSearchChange("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary/10"
            >
            <IconX size={14} className="text-muted-foreground" />
            </button>
        )}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/10 border border-secondary/10">
        {categories.map((cat) => (
            <button
            key={cat.value}
            onClick={() => {
                trackEvent('media_category_change', 'engagement', cat.value);
                onCategoryChange(cat.value);
            }}
            className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                category === cat.value
                ? "bg-muted text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            >
            {cat.label}
            </button>
        ))}
        </div>
    </motion.div>
  );
};
