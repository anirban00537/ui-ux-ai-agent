import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { Card } from "@/store/slices/cardsSlice";

export const detailedContentTopTemplate: Card = {
  id: "detailed-content-top",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc("Top Performance", "heading", 4)
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc(
          "The opening paragraph sets the stage for what follows. It introduces key concepts, establishes the narrative framework, and prepares readers for the detailed discussion ahead.",
          "paragraph"
        )
      ),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop",
    position: "top",
    size: 22,
  },
};
