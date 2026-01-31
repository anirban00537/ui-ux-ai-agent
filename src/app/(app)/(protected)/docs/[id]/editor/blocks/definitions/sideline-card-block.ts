import {
  BLOCK_TYPES,
  type SidelineCardContent,
  type SidelineCardItem,
  createProseMirrorDoc,
} from "@/types";
import { SidelineCardContentSchema } from "@/types/docs/schemas/blocks";
import { nanoid } from "nanoid";

export const createSidelineCardItem = (
  title: any = createProseMirrorDoc("Key Insight", "heading", 5),
  description: any = createProseMirrorDoc(
    "Highlight important takeaways here. The vertical accent draws attention."
  )
): SidelineCardItem => ({
  id: nanoid(),
  title,
  description,
});

export const createSidelineCardContent = (
  itemCount: number = 3
): SidelineCardContent => ({
  type: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
  items: Array.from({ length: itemCount }, () => createSidelineCardItem()),
});

export const normalizeSidelineCardContent = (
  content: any
): SidelineCardContent => {
  if (!content || typeof content !== "object")
    return createSidelineCardContent();

  // Handle legacy single content migration
  if (content.editorContent && !content.items) {
    return {
      type: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
      items: [
        createSidelineCardItem(
          createProseMirrorDoc("Insight", "heading", 3),
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

  const result = SidelineCardContentSchema.safeParse({
    ...content,
    items: items || createSidelineCardContent().items,
  });

  if (result.success) {
    return result.data;
  }

  return createSidelineCardContent();
};
