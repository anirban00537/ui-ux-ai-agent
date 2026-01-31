import { SpacerContentSchema, type SpacerContent } from "@/types";

export const createSpacerContent = (height: number = 64): SpacerContent => ({
  type: "spacer",
  height,
});

export const normalizeSpacerContent = (content: any): SpacerContent => {
  const result = SpacerContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  return createSpacerContent(content?.height);
};
