"use client";

import React, { useState } from "react";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion } from "framer-motion";
import {
  CardCanvas,
  EditorBackground,
  BlockSelectionProvider,
  ToolbarPanel,
  DragPreview,
  LoadingOverlay,
} from "@/app/(app)/(protected)/docs/[id]/editor";
import { useLayoutEditor } from "./hooks/useLayoutEditor";
import { 
  LayoutMetadataPanel, 
  LayoutListPanel, 
  LayoutEditorHeader 
} from "@/components/layout-editor";
import { EditorThemeProvider } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";

/**
 * Layout Editor Page - Admin tool for creating and editing layout templates
 * This is a standalone editor that reuses all doc editor components
 * but operates on a single layout template instead of multiple cards.
 */
const LayoutEditorPage = () => {
  return (
    <EditorThemeProvider>
      <LayoutEditorContent />
    </EditorThemeProvider>
  );
};

const LayoutEditorContent = () => {
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [showLayoutList, setShowLayoutList] = useState(false);

  const {
    layoutData,
    layoutMetadata,
    theme,
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    isLoading,
    isSaving,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleUpdateAccent,
    handleDeleteBlock,
    handleAddLayoutRow,
    handleSaveLayout,
    handleUpdateMetadata,
    handleLoadLayout,
    handleResetLayout,
  } = useLayoutEditor();

  const isDark = theme.themeType === "dark";

  const handleCreateNew = () => {
    handleResetLayout();
  };

  if (isLoading) {
    return (
      <>
        <GoogleFontsLoader />
        <LoadingOverlay isGenerating={false} progress={null} />
      </>
    );
  }

  return (
    <>
      <GoogleFontsLoader />

      {/* Header with Save/Browse/Reset controls */}
      <LayoutEditorHeader
        metadata={layoutMetadata}
        isSaving={isSaving}
        onSave={() => setShowMetadataPanel(true)}
        onBrowseLayouts={() => setShowLayoutList(true)}
        onReset={handleResetLayout}
      />

      <EditorBackground theme={theme} />

      {/* Scrollable content container */}
      <div className="min-h-screen overflow-y-auto pt-16 relative">
        <div className="w-full mx-auto px-6 py-10">
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <BlockSelectionProvider>
              {/* Blocks Panel */}
              <ToolbarPanel 
                docId="layout-editor" 
                onLayoutSelect={(layout) => {
                  handleAddLayoutRow(layout.columnCount || 1, layout.blockType);
                }}
              />

              {/* Layout Canvas */}
              <div className="flex flex-col gap-8">
                {/* Info Banner */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-5xl mx-auto w-full"
                >
                  <div
                    className="px-6 py-4 rounded-xl border"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(43, 10, 255, 0.1)"
                        : "rgba(43, 10, 255, 0.05)",
                      borderColor: theme.primary + "30",
                    }}
                  >
                    <h2
                      className="text-sm font-semibold mb-1"
                      style={{ color: theme.headingColor }}
                    >
                      🎨 Layout Editor (Admin Only)
                    </h2>
                    <p
                      className="text-xs opacity-70"
                      style={{ color: theme.bodyColor }}
                    >
                      Create reusable layout templates. Add blocks, arrange them, and save
                      as a template for docs.
                    </p>
                  </div>
                </motion.div>

                {/* Layout Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <CardCanvas
                    card={{
                      id: "layout-preview",
                      rows: layoutData.rows,
                      accent: layoutData.accent,
                    }}
                    onUpdateBlock={handleUpdateBlock}
                    onDeleteRow={handleDeleteRow}
                    onAddColumn={handleAddColumn}
                    onAddRowAtTop={handleAddRowAtTop}
                    onAddRowAtBottom={handleAddRowAtBottom}
                    onUpdateColumnWidths={handleUpdateColumnWidths}
                    onUpdateAccent={handleUpdateAccent}
                    onDeleteBlock={handleDeleteBlock}
                    enableDragHints={true}
                    readOnly={false}
                  />
                </motion.div>
              </div>
            </BlockSelectionProvider>

            {/* Drag Overlay */}
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              {activeBlock && <DragPreview block={activeBlock} theme={theme} />}
              {isBlockDragging && draggingBlockType && (
                <DragPreview blockType={draggingBlockType} theme={theme} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Metadata Panel for saving */}
      <LayoutMetadataPanel
        isOpen={showMetadataPanel}
        metadata={layoutMetadata}
        isSaving={isSaving}
        onClose={() => setShowMetadataPanel(false)}
        onSave={handleSaveLayout}
        onUpdateMetadata={handleUpdateMetadata}
        theme={theme}
      />

      {/* Layout List Panel for browsing/selecting layouts */}
      <LayoutListPanel
        isOpen={showLayoutList}
        onClose={() => setShowLayoutList(false)}
        onSelectLayout={handleLoadLayout}
        onCreateNew={handleCreateNew}
        currentLayoutId={layoutMetadata.id}
        theme={theme}
      />
    </>
  );
};

export default LayoutEditorPage;
