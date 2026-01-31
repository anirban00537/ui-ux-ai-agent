import { nanoid } from "nanoid";
import {
  StackedTimelineContentSchema,
  type StackedTimelineContent,
  type StackedTimelineItem,
  createProseMirrorDoc,
} from "@/types";

export const createStackedTimelineItem = (): StackedTimelineItem => ({
  id: nanoid(),
  title: createProseMirrorDoc("Item", "heading", 5) as any,
  description: createProseMirrorDoc("Description") as any,
});

export const createStackedTimelineContent = (
  itemCount: number = 3
): StackedTimelineContent => ({
  type: "stacked-timeline-block",
  items: Array.from({ length: itemCount }, () => createStackedTimelineItem()),
});

export const normalizeStackedTimelineContent = (
  content: any
): StackedTimelineContent => {
  if (!content || typeof content !== "object") {
    return createStackedTimelineContent();
  }

  const result = StackedTimelineContentSchema.safeParse(content);

  if (result.success) {
    return result.data;
  }

  return createStackedTimelineContent();
};
