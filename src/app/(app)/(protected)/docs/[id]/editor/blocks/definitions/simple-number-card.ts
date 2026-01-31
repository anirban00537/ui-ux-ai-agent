import {
  SimpleNumberCardContentSchema,
  type SimpleNumberCardContent,
  type SimpleNumberCardItem,
  createProseMirrorDoc,
} from "@/types";
import { nanoid } from "nanoid";

export const createSimpleNumberCardItem = (
  number: number = 1,
  title: any = createProseMirrorDoc("Point Title", "heading", 5),
  description: any = createProseMirrorDoc(
    "Provide context and detail about this key point here."
  )
): SimpleNumberCardItem => ({
  id: nanoid(),
  number,
  title,
  description,
});

export const createSimpleNumberCardContent = (
  itemCount: number = 3
): SimpleNumberCardContent => ({
  type: "simple-number-card",
  items: Array.from({ length: itemCount }, (_, i) =>
    createSimpleNumberCardItem(i + 1)
  ),
});

export const normalizeSimpleNumberCardContent = (
  content: any
): SimpleNumberCardContent => {
  if (!content || typeof content !== "object")
    return createSimpleNumberCardContent();

  // Handle legacy single-block migration (if it existed)
  if (content.number !== undefined && content.editorContent && !content.items) {
    return {
      type: "simple-number-card",
      items: [
        createSimpleNumberCardItem(
          content.number,
          createProseMirrorDoc("Title", "heading", 3),
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
          number: item.number ?? 1,
          title: item.title || createProseMirrorDoc("Title", "heading", 3),
          description: item.description || item.editorContent,
        };
      }
      return {
        id: item.id || nanoid(),
        number: item.number ?? 1,
        title: item.title || createProseMirrorDoc("Title", "heading", 3),
        description: item.description || createProseMirrorDoc("Description"),
      };
    });
  }

  const result = SimpleNumberCardContentSchema.safeParse({
    ...content,
    items: items || createSimpleNumberCardContent().items,
  });

  if (result.success) {
    return result.data;
  }

  return createSimpleNumberCardContent();
};
