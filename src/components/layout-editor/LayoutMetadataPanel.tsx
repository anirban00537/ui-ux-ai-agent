import React, { useState, useEffect } from "react";
import { X, Save, Tag, FileText, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "@/types";
import type { LayoutMetadata } from "@/app/(app)/(protected)/(layout-editor)/hooks/useLayoutEditor";

interface LayoutMetadataPanelProps {
  isOpen: boolean;
  metadata: LayoutMetadata;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdateMetadata: (updates: Partial<LayoutMetadata>) => void;
  theme: Theme;
}

export function LayoutMetadataPanel({
  isOpen,
  metadata,
  isSaving,
  onClose,
  onSave,
  onUpdateMetadata,
  theme,
}: LayoutMetadataPanelProps) {
  const [localMetadata, setLocalMetadata] = useState(metadata);
  const [tagInput, setTagInput] = useState("");

  const isDark = theme.themeType === "dark";

  // Sync with parent metadata
  useEffect(() => {
    setLocalMetadata(metadata);
  }, [metadata]);

  const handleSave = () => {
    // Update parent metadata
    onUpdateMetadata(localMetadata);
    // Trigger save
    onSave();
    // Close panel after save
    setTimeout(() => {
      if (!isSaving) onClose();
    }, 500);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !localMetadata.tags.includes(tagInput.trim())) {
      setLocalMetadata({
        ...localMetadata,
        tags: [...localMetadata.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setLocalMetadata({
      ...localMetadata,
      tags: localMetadata.tags.filter((t) => t !== tag),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

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
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-hidden"
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
                <h2
                  className="text-lg font-semibold"
                  style={{ color: theme.headingColor }}
                >
                  Save Layout
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} style={{ color: theme.bodyColor }} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Name */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-2"
                    style={{ color: theme.headingColor }}
                  >
                    <Type size={16} />
                    Layout Name *
                  </label>
                  <input
                    type="text"
                    value={localMetadata.name}
                    onChange={(e) =>
                      setLocalMetadata({ ...localMetadata, name: e.target.value })
                    }
                    placeholder="e.g., Hero Section Layout"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
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

                {/* Description */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-2"
                    style={{ color: theme.headingColor }}
                  >
                    <FileText size={16} />
                    Description
                  </label>
                  <textarea
                    value={localMetadata.description}
                    onChange={(e) =>
                      setLocalMetadata({ ...localMetadata, description: e.target.value })
                    }
                    placeholder="Describe this layout template..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
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

                {/* Tags */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-2"
                    style={{ color: theme.headingColor }}
                  >
                    <Tag size={16} />
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
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
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: theme.primary,
                        color: "#fff",
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localMetadata.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-md text-sm flex items-center gap-1.5"
                        style={{
                          backgroundColor: theme.primary + "15",
                          color: theme.primary,
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = localMetadata.tags.filter((t: string) => t !== tag);
                            setLocalMetadata({
                              ...localMetadata,
                              tags: newTags
                            });
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>


                {/* Icon (optional) */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-2"
                    style={{ color: theme.headingColor }}
                  >
                    Icon Name (Tabler Icons)
                  </label>
                  <input
                    type="text"
                    value={localMetadata.icon || ""}
                    onChange={(e) =>
                      setLocalMetadata({ ...localMetadata, icon: e.target.value })
                    }
                    placeholder="e.g., IconLayout, IconGrid"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
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
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 border-t flex gap-3"
                style={{
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              >
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    color: theme.bodyColor,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !localMetadata.name.trim()}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme.primary,
                    color: "#fff",
                  }}
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Layout"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
