import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { Card } from "@/store/slices/cardsSlice";

export const quoteTemplate: Card = {
  id: "quote-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "Inspiration" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: '> "Design is not just what it looks like and feels like. Design is how it works."',
              },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "right" },
            content: [{ type: "text", text: "— Steve Jobs" }],
          },
        ],
      }),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618004652321-13a63e576b80?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 25,
  },
};
