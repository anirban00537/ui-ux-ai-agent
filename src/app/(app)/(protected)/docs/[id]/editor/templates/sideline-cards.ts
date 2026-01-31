import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { createSidelineCardContent } from "../blocks/definitions/sideline-card-block";
import { Card } from "@/store/slices/cardsSlice";

export const sidelineCardsTemplate: Card = {
  id: "sideline-card-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "Key Insights" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.SIDELINE_CARD_BLOCK,
        createSidelineCardContent(3)
      ),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618005198914-c3b6f1f11ac6?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 28,
  },
};
