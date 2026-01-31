"use client";


import React from "react";
import { DragOverlay } from "@dnd-kit/core";
import { 
  DragPreview, 
  useEditorDndContext, 
  useEditorTheme 
} from "@/app/(app)/(protected)/docs/[id]/editor";


const DragOverlayWrapper = () => {
  const { activeBlock, isDragging, draggingBlockType } = useEditorDndContext();
  const theme = useEditorTheme();
  
  return (
    <DragOverlay
      dropAnimation={{
        duration: 200,
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      {activeBlock && (
        <DragPreview block={activeBlock} theme={theme} />
      )}
      {isDragging && draggingBlockType && (
        <DragPreview blockType={draggingBlockType} theme={theme} />
      )}
    </DragOverlay>
  );
};

export default DragOverlayWrapper;