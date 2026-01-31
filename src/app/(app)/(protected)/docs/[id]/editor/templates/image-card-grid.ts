import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { createImageCardContent } from "../blocks/definitions/image-card-block";
import { Card } from "@/store/slices/cardsSlice";

export const imageCardGridTemplate: Card = {
  id: "image-card-grid",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "Visual Showcase" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Discover our products and services through stunning visuals.",
              },
            ],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.IMAGE_CARD_BLOCK,
        createImageCardContent(3)
      ),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop",
    position: "background",
    size: 15,
  },
};
