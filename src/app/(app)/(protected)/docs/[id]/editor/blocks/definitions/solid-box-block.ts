import {
  BLOCK_TYPES,
  type SolidBoxContent,
  type SolidBoxItem,
  createProseMirrorDoc,
} from "@/types";
import { SolidBoxContentSchema } from "@/types/docs/schemas/blocks";
import { nanoid } from "nanoid";

export const createSolidBoxItem = (
  title: any = createProseMirrorDoc("Major Point", "heading", 5),
  description: any = createProseMirrorDoc(
    "Standard content with a solid presence. Strong blocks build reliable structures."
  )
): SolidBoxItem => ({
  id: nanoid(),
  title,
  description,
});

export const createSolidBoxContent = (
  itemCount: number = 3
): SolidBoxContent => ({
  type: BLOCK_TYPES.SOLID_BOX_BLOCK,
  items: Array.from({ length: itemCount }, () => createSolidBoxItem()),
});

export const normalizeSolidBoxContent = (content: any): SolidBoxContent => {
  if (!content || typeof content !== "object") return createSolidBoxContent();

  // Handle legacy single content migration
  if (content.editorContent && !content.items) {
    return {
      type: BLOCK_TYPES.SOLID_BOX_BLOCK,
      items: [
        createSolidBoxItem(
          createProseMirrorDoc("Point", "heading", 3),
          content.editorContent
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
          title: item.title || createProseMirrorDoc("Title", "heading", 3),
          description: item.description || item.editorContent,
        };
      }
      return {
        id: item.id || nanoid(),
        title: item.title || createProseMirrorDoc("Title", "heading", 3),
        description: item.description || createProseMirrorDoc("Description"),
      };
    });
  }

  const result = SolidBoxContentSchema.safeParse({
    ...content,
    items: items || createSolidBoxContent().items,
  });

  if (result.success) {
    return result.data;
  }

  return createSolidBoxContent();
};
