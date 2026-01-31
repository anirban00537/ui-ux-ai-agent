import React from "react";
import { Save, FolderOpen, RotateCcw, ArrowLeft, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LayoutMetadata } from "@/app/(app)/(protected)/(layout-editor)/hooks/useLayoutEditor";

interface LayoutEditorHeaderProps {
  metadata: LayoutMetadata;
  isSaving: boolean;
  onSave: () => void;
  onBrowseLayouts: () => void;
  onReset: () => void;
}

export function LayoutEditorHeader({
  metadata,
  isSaving,
  onSave,
  onBrowseLayouts,
  onReset,
}: LayoutEditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Back button and title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {metadata.name || "Untitled Layout"}
                </h1>
                {metadata.id ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    Saved
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {metadata.id ? `ID: ${metadata.id.slice(0, 8)}...` : "Not saved yet"}
                {metadata.description && ` • ${metadata.description.slice(0, 50)}${metadata.description.length > 50 ? '...' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          {/* Reset Button */}
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          {/* Browse Layouts Button */}
          <button
            onClick={onBrowseLayouts}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Library size={16} />
            Browse Layouts
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      </div>
    </div>
  );
}
