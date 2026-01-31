import { BlockContent, BLOCK_TYPES } from "@/types";
import { ButtonBlockContentSchema } from "@/types/docs/schemas/blocks";

export const createButtonBlockContent = (): any => ({
  type: BLOCK_TYPES.BUTTON_BLOCK,
  text: "Click here",
  link: "",
  style: "filled",
  alignment: "center",
  color: "default",
});

export const normalizeButtonBlockContent = (content: unknown): any => {
  const parsed = ButtonBlockContentSchema.safeParse(content);
  if (parsed.success) {
    return parsed.data;
  }
  return createButtonBlockContent();
};
