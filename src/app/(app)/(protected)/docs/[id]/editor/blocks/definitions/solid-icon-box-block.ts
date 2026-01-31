import {
  BLOCK_TYPES,
  type SolidIconBoxContent,
  type SolidIconBoxItem,
  createProseMirrorDoc,
} from "@/types";
import { SolidIconBoxContentSchema } from "@/types/docs/schemas/blocks";
import { nanoid } from "nanoid";

export const createSolidIconBoxItem = (
  icon: string = "star",
  title: any = createProseMirrorDoc("Feature Title", "heading", 5),
  description: any = createProseMirrorDoc(
    "Highlight essential capabilities with visual cues. Pair icons with clear text for immediate recognition."
  )
): SolidIconBoxItem => ({
  id: nanoid(),
  icon,
  title,
  description,
});

export const createSolidIconBoxContent = (
  itemCount: number = 3
): SolidIconBoxContent => ({
  type: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
  items: Array.from({ length: itemCount }, () => createSolidIconBoxItem()),
});

export const normalizeSolidIconBoxContent = (
  content: any
): SolidIconBoxContent => {
  if (!content || typeof content !== "object")
    return createSolidIconBoxContent();

  // Handle legacy single content migration
  if ((content.editorContent || content.icon) && !content.items) {
    return {
      type: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
      items: [
        createSolidIconBoxItem(
          content.icon || "star",
          createProseMirrorDoc("Feature", "heading", 3),
          content.editorContent || createProseMirrorDoc("Description")
        ),
      ],
    };
  }

  // Handle items migration
  let items = content.items;
  if (Array.isArray(content.items)) {
    items = content.items.map((item: any) => {
      if (item.editorContent && (!item.title || !item.description)) {
        return {
          id: item.id || nanoid(),
          icon: item.icon || "star",
          title: item.title || createProseMirrorDoc("Title", "heading", 3),
          description: item.description || item.editorContent,
        };
      }
      return {
        id: item.id || nanoid(),
        icon: item.icon || "star",
        title: item.title || createProseMirrorDoc("Title", "heading", 3),
        description: item.description || createProseMirrorDoc("Description"),
      };
    });
  }

  const result = SolidIconBoxContentSchema.safeParse({
    ...content,
    items: items || createSolidIconBoxContent().items,
  });

  if (result.success) {
    return result.data;
  }

  return createSolidIconBoxContent();
};
