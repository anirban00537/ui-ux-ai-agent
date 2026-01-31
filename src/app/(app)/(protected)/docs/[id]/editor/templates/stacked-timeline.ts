import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { createStackedTimelineContent } from "../blocks/definitions/stacked-timeline-block";
import { Card } from "@/store/slices/cardsSlice";

export const stackedTimelineTemplate: Card = {
  id: "stacked-timeline-layout",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [{ type: "text", text: "Project Roadmap" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Key milestones and deliverables for the upcoming phases of development.",
              },
            ],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.STACKED_TIMELINE_BLOCK,
        createStackedTimelineContent()
      ),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 28,
  },
};
