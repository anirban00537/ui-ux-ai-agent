import { nanoid } from "nanoid";
import {
  TimelineBentoContentSchema,
  type TimelineBentoContent,
  type TimelineBentoItem,
  createProseMirrorDoc,
} from "@/types";

export const createTimelineBentoItem = (): TimelineBentoItem => ({
  id: nanoid(),
  title: createProseMirrorDoc("Item", "heading", 5) as any,
  description: createProseMirrorDoc("Description") as any,
});

export const createTimelineBentoContent = (
  itemCount: number = 4
): TimelineBentoContent => ({
  type: "timeline-bento-block",
  items: Array.from({ length: itemCount }, () => createTimelineBentoItem()),
});

export const normalizeTimelineBentoContent = (
  content: any
): TimelineBentoContent => {
  if (!content || typeof content !== "object") {
    return createTimelineBentoContent();
  }

  const result = TimelineBentoContentSchema.safeParse(content);

  if (result.success) {
    return result.data;
  }

  return createTimelineBentoContent();
};
