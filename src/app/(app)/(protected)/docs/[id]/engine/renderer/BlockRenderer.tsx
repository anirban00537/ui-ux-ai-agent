import React, { memo, useMemo, useCallback } from "react";
import type { Block, BlockContent, BlockType } from "@/types";
import { useEditorTheme } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { BlockErrorBoundary } from "./BlockErrorBoundary";
import { BLOCK_DEFINITIONS } from "@/app/(app)/(protected)/docs/[id]/engine/registry/block-definitions";
import { BLOCK_TYPES } from "@/types";

interface BlockRendererProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  placeholder?: string;
  readOnly?: boolean;
  isStreaming?: boolean;
}

export const BlockRenderer = memo(function BlockRenderer({
  block,
  onUpdate,
  placeholder,
  readOnly = false,
  isStreaming = false,
}: BlockRendererProps) {
  const theme = useEditorTheme();
  
  const type = (block.type && BLOCK_DEFINITIONS[block.type as BlockType]) 
    ? (block.type as BlockType) 
    : BLOCK_TYPES.PROSEMIRROR;
    
  const definition = BLOCK_DEFINITIONS[type];
  const Component = definition.component;

  // Memoize the normalized block to avoid recalculating on every render
  const normalized = useMemo(() => ({
    ...block,
    content: definition.normalizeContent(block.content),
  }), [block, definition]);

  // Memoize the no-op callback for readOnly mode
  const handleUpdate = useCallback(
    (content: BlockContent) => {
      if (!readOnly) {
        onUpdate(content);
      }
    },
    [onUpdate, readOnly]
  );

  return (
    <BlockErrorBoundary
      blockId={block.id}
      blockType={block.type}
    >
      <React.Suspense fallback={<div className="h-12 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />}>
        <Component
          block={normalized}
          onUpdate={handleUpdate}
          theme={theme}
          placeholder={placeholder}
          readOnly={readOnly}
          isStreaming={isStreaming}
        />
      </React.Suspense>
    </BlockErrorBoundary>
  );
});
