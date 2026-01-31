import React, { useState } from "react";
import { X, Plus, Search, Edit, Trash2, Calendar, Tag, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "@/types";
import type { LayoutTemplate } from "@/services/layouts";
import { useLayouts, useDeleteLayout } from "@/app/(app)/(protected)/(layout-editor)/hooks/useLayoutEditor";

interface LayoutListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (layoutId: string) => void;
  onCreateNew: () => void;
  theme: Theme;
  currentLayoutId?: string;
}

export function LayoutListPanel({
  isOpen,
  onClose,
  onSelectLayout,
  onCreateNew,
  theme,
  currentLayoutId,
}: LayoutListPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "admin" | "user">("all");

  const isDark = theme.themeType === "dark";

  // TanStack Query hooks
  const { data: layouts = [] as LayoutTemplate[], isLoading, refetch } = useLayouts();
  const deleteLayoutMutation = useDeleteLayout();

  const handleDeleteLayout = async (layoutId: string, layoutName: string) => {
    if (!confirm(`Are you sure you want to delete "${layoutName}"?`)) {
      return;
    }

    try {
      await deleteLayoutMutation.mutateAsync(layoutId);
      // Refetch is automatic via query invalidation
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Delete error:", error);
    }
  };

  // Filter layouts
  const filteredLayouts = layouts.filter((layout: LayoutTemplate) => {
    const matchesSearch =
      layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layout.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === "all" || layout.type === filterType;

    return matchesSearch && matchesType;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-2xl z-50 overflow-hidden"
          >
            <div
              className="h-full flex flex-col"
              style={{
                backgroundColor: isDark
                  ? "rgba(20, 20, 30, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              >
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: theme.headingColor }}
                  >
                    Layout Library
                  </h2>
                  <p
                    className="text-xs opacity-60"
                    style={{ color: theme.bodyColor }}
                  >
                    {filteredLayouts.length} layout{filteredLayouts.length !== 1 ? "s" : ""} available
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onCreateNew();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    style={{
                      backgroundColor: theme.primary,
                      color: "#fff",
                    }}
                  >
                    <Plus size={16} />
                    New Layout
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={20} style={{ color: theme.bodyColor }} />
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div
                className="px-6 py-4 border-b space-y-3"
                style={{
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Search */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                    style={{ color: theme.bodyColor }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search layouts..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                      color: theme.bodyColor,
                    }}
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  {["all", "admin", "user"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filterType === type ? "ring-2" : ""
                      }`}
                      style={{
                        backgroundColor:
                          filterType === type
                            ? theme.primary + "20"
                            : isDark
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.02)",
                        color:
                          filterType === type ? theme.primary : theme.bodyColor,
                        borderColor: filterType === type ? theme.primary : "transparent",
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layouts List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
                      style={{ borderColor: theme.primary + "40", borderTopColor: "transparent" }}
                    />
                  </div>
                ) : filteredLayouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p
                      className="text-sm opacity-60"
                      style={{ color: theme.bodyColor }}
                    >
                      {searchQuery || filterType !== "all"
                        ? "No layouts found matching your criteria"
                        : "No layouts available. Create your first layout!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLayouts.map((layout: LayoutTemplate) => {
                      const isSelected = currentLayoutId === layout.id;
                      return (
                        <motion.div
                          key={layout.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                            isSelected ? 'ring-2 shadow-lg' : 'hover:shadow-lg'
                          }`}
                          style={{
                            backgroundColor: isSelected
                              ? theme.primary + '08'
                              : isDark
                              ? "rgba(255, 255, 255, 0.03)"
                              : "rgba(0, 0, 0, 0.02)",
                            borderColor: isSelected
                              ? theme.primary
                              : isDark
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                          }}
                          onClick={() => {
                            onSelectLayout(layout.id);
                            onClose();
                          }}
                        >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold mb-1 truncate"
                              style={{ color: theme.headingColor }}
                            >
                              {layout.name}
                            </h3>
                            {layout.description && (
                              <p
                                className="text-sm opacity-70 mb-2 line-clamp-2"
                                style={{ color: theme.bodyColor }}
                              >
                                {layout.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs opacity-60">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {layout.updatedAt ? new Date(layout.updatedAt).toLocaleDateString() : "Unknown"}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    layout.type === "admin"
                                      ? theme.primary + "20"
                                      : isDark
                                      ? "rgba(255, 255, 255, 0.1)"
                                      : "rgba(0, 0, 0, 0.05)",
                                  color: layout.type === "admin" ? theme.primary : theme.bodyColor,
                                }}
                              >
                                {layout.type}
                              </span>
                              {layout.usageCount !== undefined && layout.usageCount > 0 && (
                                <span>Used {layout.usageCount}×</span>
                              )}
                            </div>
                            {layout.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {layout.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
                                    style={{
                                      backgroundColor: isDark
                                        ? "rgba(255, 255, 255, 0.05)"
                                        : "rgba(0, 0, 0, 0.03)",
                                      color: theme.bodyColor,
                                      opacity: 0.7,
                                    }}
                                  >
                                    <Tag size={10} />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectLayout(layout.id);
                                onClose();
                              }}
                              className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                              title="Edit layout"
                            >
                              <Edit size={16} style={{ color: theme.primary }} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLayout(layout.id, layout.name);
                              }}
                              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Delete layout"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
