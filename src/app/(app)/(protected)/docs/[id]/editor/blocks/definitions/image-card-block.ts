import {
  BLOCK_TYPES,
  type ImageCardContent,
  type ImageCardItem,
  createProseMirrorDoc,
} from "@/types";
import { ImageCardContentSchema } from "@/types/docs/schemas/blocks";
import { nanoid } from "nanoid";

export const createImageCardItem = (
  imageUrl: string = "",
  imageAlt: string = "",
  title: any = createProseMirrorDoc("Card Title", "heading", 5),
  description: any = createProseMirrorDoc(
    "Add a compelling description that complements the image and provides context."
  ),
  imageQuery?: string
): ImageCardItem => ({
  id: nanoid(),
  imageUrl: imageUrl || (imageQuery ? "" : "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop"),
  imageAlt,
  title,
  description,
  objectFit: "cover",
  imageQuery,
});

export const createImageCardContent = (
  itemCount: number = 3
): ImageCardContent => ({
  type: BLOCK_TYPES.IMAGE_CARD_BLOCK,
  items: Array.from({ length: itemCount }, () => createImageCardItem()),
});

export const normalizeImageCardContent = (
  content: any
): ImageCardContent => {
  if (!content || typeof content !== "object")
    return createImageCardContent();

  // Handle legacy single-block migration
  if (content.imageUrl && !content.items) {
    return {
      type: BLOCK_TYPES.IMAGE_CARD_BLOCK,
      items: [
        createImageCardItem(
          content.imageUrl,
          content.imageAlt || "",
          content.title || createProseMirrorDoc("Title", "heading", 3),
          content.description || createProseMirrorDoc("Description")
        ),
      ],
    };
  }

  // Handle items migration
  let items = content.items;
  if (Array.isArray(content.items)) {
    items = content.items.map((item: any) => {
      return {
        id: item.id || nanoid(),
        imageUrl: item.imageUrl || (item.imageQuery ? "" : "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop"),
        imageAlt: item.imageAlt || "",
        title: item.title || createProseMirrorDoc("Title", "heading", 3),
        description: item.description || createProseMirrorDoc("Description"),
        objectFit: item.objectFit || "cover",
        attribution: item.attribution,
        imageQuery: item.imageQuery,
      };
    });
  }

  const result = ImageCardContentSchema.safeParse({
    ...content,
    items: items || createImageCardContent().items,
  });

  if (result.success) {
    return result.data;
  }

  return createImageCardContent();
};
