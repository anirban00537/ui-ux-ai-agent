import { nanoid } from "nanoid";
import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { Card } from "@/store/slices/cardsSlice";

export const introductionTemplate: Card = {
  id: "introduction",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.SPACER, {
        type: "spacer",
        height: 120,
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Doc Title" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Supporting subtitle or abstract about your topic",
              },
            ],
          },
        ],
      }),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.SPACER, {
        type: "spacer",
        height: 120,
      }),
    ]),
  ],
};
