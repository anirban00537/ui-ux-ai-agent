"use client";

import React, { createContext, useContext, ReactNode, useCallback, useState } from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DndContextProps,
  closestCenter,
  pointerWithin,
} from "@dnd-kit/core";
import { Block, Card } from "@/types";
import { EditorCommandBus } from "@/lib/editor/commands";
import { useEditorDnd } from "@/app/(app)/(protected)/docs/[id]/hooks/useEditorDnd";

// Define the shape of the DnD state we want to expose
interface EditorDndContextValue {
  isDragging: boolean;
  activeBlock: Block | null;
  draggingBlockType: string | null;
  activeId: string | null; // From @dnd-kit, mostly for internal use but exposed if needed
  handleDragStart: (event: DragStartEvent) => void;
  // We can add more specific state here exposed by useEditorDnd if needed
}

const EditorDndContext = createContext<EditorDndContextValue | null>(null);

interface EditorDndProviderProps {
  children: ReactNode;
  cards: Card[];
  commandBus: EditorCommandBus;
}

export const EditorDndProvider: React.FC<EditorDndProviderProps> = ({
  children,
  cards,
  commandBus,
}) => {
  // We reuse the logic from useEditorDnd hook which encapsulates sensors and state
  const {
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
  } = useEditorDnd({ cards, commandBus });

  return (
    <EditorDndContext.Provider
      value={{
        isDragging: isBlockDragging || !!activeBlock,
        activeBlock,
        draggingBlockType,
        activeId: activeBlock?.id || null, // simplified
        handleDragStart,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    </EditorDndContext.Provider>
  );
};

export const useEditorDndContext = () => {
  const context = useContext(EditorDndContext);
  if (!context) {
    throw new Error("useEditorDndContext must be used within an EditorDndProvider");
  }
  return context;
};
