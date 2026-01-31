import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { createLeafBlockContent } from "../blocks/definitions/leaf-block";
import { Card } from "@/store/slices/cardsSlice";

export const leafCardsTemplate: Card = {
  id: "leaf-card-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "Core Values" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.LEAF_BLOCK, createLeafBlockContent(3)),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?q=80&w=1964&auto=format&fit=crop",
    position: "right",
    size: 25,
  },
};
