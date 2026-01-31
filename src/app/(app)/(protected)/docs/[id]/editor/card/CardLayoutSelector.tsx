import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui";

import type { LayoutTemplate } from "@/types";
import { DynamicIcon } from "../ui/DynamicIcon";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { motion } from "framer-motion";
import { useAdminLayouts } from "@/hooks";
import { layoutsService } from "@/services";
import { toast } from "sonner";

interface CardLayoutSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (template: LayoutTemplate) => void;
}

export const CardLayoutSelector: React.FC<CardLayoutSelectorProps> = ({
  isOpen,
  onClose,
  onSelectLayout,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const { data: adminLayouts, isLoading, error } = useAdminLayouts();
  const [isFetchingDetails, setIsFetchingDetails] = React.useState<
    string | null
  >(null);

  // Combine local templates with admin layouts from DB
  // We prioritize DB layouts but can fallback to local if needed
  const displayLayouts = React.useMemo(() => {
    if (adminLayouts && adminLayouts.length > 0) {
      const dbLayouts = adminLayouts.map((l: any) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        icon: l.icon,
        dbId: l.id,
      }));

      return dbLayouts;
    }

    return [];
  }, [adminLayouts]);

  const handleSelect = async (template: any) => {
    if (template.dbId) {
      setIsFetchingDetails(template.id);
      try {
        const response = await layoutsService.getLayout(template.dbId);
        if (response.success) {
          const apiData = response.data as any;

          // Transform API response to LayoutTemplate format
          // API returns a doc with cards array, but we need a layout template
          let layoutTemplate: LayoutTemplate;

          if (
            apiData.cards &&
            Array.isArray(apiData.cards) &&
            apiData.cards.length > 0
          ) {
            // Extract the first card's data
            const firstCard = apiData.cards[0];
            layoutTemplate = {
              id: apiData.id || template.id,
              name: (apiData as any).title || template.name,
              description: apiData.description || template.description,
              icon: template.icon,
              type: "admin",
              tags: apiData.tags || [],
              data: {
                rows: firstCard.data?.rows || [],
                accent: firstCard.data?.accent,
              },
              createdAt: apiData.createdAt,
              updatedAt: apiData.updatedAt,
            };
          } else if (apiData.data) {
            // If it's already in the correct format
            layoutTemplate = {
              id: apiData.id || template.id,
              name: apiData.name || (apiData as any).title || template.name,
              description: apiData.description || template.description,
              icon: apiData.icon || template.icon,
              type: apiData.type || "admin",
              tags: apiData.tags || [],
              data: apiData.data,
              createdAt: apiData.createdAt,
              updatedAt: apiData.updatedAt,
            };
          } else {
            // Fallback: create empty layout
            layoutTemplate = {
              id: apiData.id || template.id,
              name: apiData.name || (apiData as any).title || template.name,
              description: apiData.description || template.description,
              icon: template.icon,
              type: "admin",
              tags: [],
              data: {
                rows: [],
              },
            };
          }

          onSelectLayout(layoutTemplate);
          onClose();
        } else {
          toast.error("Failed to load layout details");
        }
      } catch (err) {
        console.error("Failed to fetch layout details", err);
        toast.error("Error connecting to server");
      } finally {
        setIsFetchingDetails(null);
      }
    } else {
      onSelectLayout(template);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]" />
      <DialogContent
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-5xl w-[95vw] max-h-[85vh] overflow-hidden p-0 z-[100] rounded-2xl"
        style={{
          backgroundColor: isDark
            ? "rgba(30, 30, 40, 0.6)"
            : "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          boxShadow: isDark
            ? `
              0 1px 0 0 rgba(255, 255, 255, 0.1) inset,
              0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
              0 24px 80px rgba(0, 0, 0, 0.5),
              0 8px 24px rgba(0, 0, 0, 0.3)
            `
            : `
              0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
              0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
              0 24px 80px rgba(0, 0, 0, 0.12),
              0 8px 24px rgba(0, 0, 0, 0.06)
            `,
          border: "none",
        }}
      >
        {/* Glass shine overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.03) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.4) 100%)",
          }}
        />

        {/* Header */}
        <DialogHeader className="relative px-6 pt-6 pb-2">
          <DialogTitle
            className="text-lg font-medium"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            Choose a Layout
          </DialogTitle>
          <p
            className="text-sm mt-1 opacity-50"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            {isLoading
              ? "Loading templates..."
              : "Select a template for your new card"}
          </p>
        </DialogHeader>

        {/* Layouts Grid */}
        <div
          className={`relative px-6 pb-6 overflow-y-auto max-h-[calc(85vh-100px)] ${
            isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
          }`}
        >
          {error && (
            <div className="text-center py-10 text-red-500">
              Failed to load templates. Showing local fallback.
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {displayLayouts.map((template: any, index: number) => (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleSelect(template)}
                disabled={isFetchingDetails !== null}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                  isFetchingDetails === template.id
                    ? "scale-95 opacity-50"
                    : "hover:scale-105"
                }`}
                style={{
                  backgroundColor: "transparent",
                  cursor: isFetchingDetails ? "wait" : "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.primary}20`,
                    color: theme.primary,
                  }}
                >
                  <DynamicIcon
                    name={template.icon as string}
                    size={24}
                    stroke={2}
                  />
                </div>

                {/* Label */}
                <span
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: isDark ? "#e5e7eb" : "#374151" }}
                >
                  {template.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
