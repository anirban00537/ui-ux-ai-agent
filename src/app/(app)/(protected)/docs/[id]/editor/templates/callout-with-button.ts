import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { createCalloutContent } from "../blocks/definitions/callout-block";
import { createButtonBlockContent } from "../blocks/definitions/button-block";
import { Card } from "@/store/slices/cardsSlice";

export const calloutWithButtonTemplate: Card = {
  id: "callout-with-button-layout",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc("Call to Action", "heading", 3)
      ),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.CALLOUT_BLOCK, createCalloutContent()),
    ]),
    createRow([
      createBlockInstance(BLOCK_TYPES.BUTTON_BLOCK, {
        ...createButtonBlockContent(),
        alignment: "center",
        text: "Get Started Now",
      }),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618004912976-3c0c1d87a641?q=80&w=1974&auto=format&fit=crop",
    position: "bottom",
    size: 20,
  },
};
