import { nanoid } from "@reduxjs/toolkit";
import { 
  Block, 
  BlockType, 
  CircleStatsContent, 
  CircleStatsItem,
  getDefaultHeadingContent, 
  createProseMirrorDoc
} from "@/types";

export const createCircleStatsItem = (value: number = 75): CircleStatsItem => ({
  id: nanoid(),
  value,
  suffix: "",
  title: createProseMirrorDoc("Statistic", "heading", 5) as any,
  description: createProseMirrorDoc("Add a short description regarding this statistic.") as any,
});

export const createCircleStatsContent = (itemCount: number = 3): CircleStatsContent => ({
  type: "circle-stats-block",
  items: Array.from({ length: itemCount }, (_, i) => 
    createCircleStatsItem(70 + (i * 10) % 30)
  ),
});

export const normalizeCircleStatsContent = (content: unknown): CircleStatsContent => {
  const defaultContent = createCircleStatsContent();
  if (!content || typeof content !== "object") return defaultContent;
  
  const c = content as Partial<CircleStatsContent>;
  if (c.type !== "circle-stats-block") return defaultContent;

  const items = Array.isArray(c.items) 
    ? c.items.map((item: any) => ({
        id: item.id || nanoid(),
        value: typeof item.value === 'number' ? item.value : 50,
        suffix: item.suffix || "",
        title: item.title || getDefaultHeadingContent(),
        description: item.description || getDefaultHeadingContent(),
      }))
    : defaultContent.items;

  return {
    type: "circle-stats-block",
    items,
  };
};

export const createCircleStatsBlock = (): Block => {
  return {
    id: nanoid(),
    type: "circle-stats-block" as BlockType,
    content: createCircleStatsContent(),
  };
};
