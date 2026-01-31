import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { createTimelineBentoContent } from "../blocks/definitions/timeline-bento-block";
import { Card } from "@/store/slices/cardsSlice";

export const timelineBentoTemplate: Card = {
  id: "timeline-bento-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "Evolution Timeline" }],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.TIMELINE_BENTO_BLOCK,
        createTimelineBentoContent(4)
      ),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618556658017-c3b0c1d87a69?q=80&w=1964&auto=format&fit=crop",
    position: "top",
    size: 20,
  },
};
