import {
  LeafBlockContentSchema,
  type LeafBlockContent,
  type LeafItem,
  createProseMirrorDoc,
} from "@/types";
import { nanoid } from "nanoid";

export const createLeafItem = (
  title: any = createProseMirrorDoc("Title", "heading", 5),
  description: any = createProseMirrorDoc(
    "This is a leaf card. It has a unique shape and style."
  )
): LeafItem => ({
  id: nanoid(),
  title,
  description,
});

export const createLeafBlockContent = (
  itemCount: number = 3
): LeafBlockContent => ({
  type: "leaf-block",
  items: Array.from({ length: itemCount }, () => createLeafItem()),
});

export const normalizeLeafBlockContent = (content: any): LeafBlockContent => {
  if (!content || typeof content !== "object") return createLeafBlockContent();

  // Handle legacy single content
  if (content.editorContent && !content.items) {
    return {
      type: "leaf-block",
      items: [
        createLeafItem(
          createProseMirrorDoc("Title", "heading", 3),
          content.editorContent
        ),
      ],
    };
  }

  // Handle items migration if they still have editorContent
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
      return item;
    });
  }

  const result = LeafBlockContentSchema.safeParse({
    ...content,
    items,
  });

  if (result.success) {
    return result.data;
  }

  return createLeafBlockContent();
};
