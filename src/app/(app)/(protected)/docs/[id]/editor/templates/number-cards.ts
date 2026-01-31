import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { createSimpleNumberCardContent } from "../blocks/definitions/simple-number-card";
import { Card } from "@/store/slices/cardsSlice";

export const numberCardsTemplate: Card = {
  id: "number-card-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "By The Numbers" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "A quantitative look at our growth and market impact this quarter.",
              },
            ],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.SIMPLE_NUMBER_CARD,
        createSimpleNumberCardContent(3)
      ),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop",
    position: "bottom",
    size: 25,
  },
};
