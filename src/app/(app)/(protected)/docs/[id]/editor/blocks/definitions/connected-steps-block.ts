import { nanoid } from "@reduxjs/toolkit";
import { 
  Block, 
  BlockType, 
  ConnectedStepsContent, 
  ConnectedStepsItem,
  getDefaultHeadingContent,
  createProseMirrorDoc
} from "@/types";

export const createConnectedStepItem = (index: number = 0): ConnectedStepsItem => ({
  id: nanoid(),
  title: createProseMirrorDoc(index === -1 ? "" : `Step ${index + 1}`, "heading", 5) as any,
  description: createProseMirrorDoc("This is a placeholder description. You can edit this text to provide more details about this specific step in the process.") as any,
});

export const createConnectedStepsContent = (itemCount: number = 3): ConnectedStepsContent => ({
  type: "connected-steps-block",
  items: Array.from({ length: itemCount }, (_, i) => createConnectedStepItem(i)),
});

export const normalizeConnectedStepsContent = (content: unknown): ConnectedStepsContent => {
  const defaultContent = createConnectedStepsContent();
  if (!content || typeof content !== "object") return defaultContent;
  
  const c = content as Partial<ConnectedStepsContent>;
  if (c.type !== "connected-steps-block") return defaultContent;

  const items = Array.isArray(c.items) 
    ? c.items.map((item: any) => ({
        id: item.id || nanoid(),
        title: item.title || getDefaultHeadingContent(),
        description: item.description || getDefaultHeadingContent(),
      }))
    : defaultContent.items;

  return {
    type: "connected-steps-block",
    items,
  };
};

export const createConnectedStepsBlock = (): Block => {
  return {
    id: nanoid(),
    type: "connected-steps-block" as BlockType,
    content: createConnectedStepsContent(),
  };
};
