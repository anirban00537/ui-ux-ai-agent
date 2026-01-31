import { BLOCK_TYPES } from "../blocks/definitions";
import {
  createBlockInstance,
  createRow,
} from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { createProseMirrorDoc } from "@/types/docs/schemas/blocks";
import { Card } from "@/store/slices/cardsSlice";

export const detailedContentLeftTemplate: Card = {
  id: "detailed-content-left",
  rows: [
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc("Main Topic", "heading", 4)
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc(
          "This section provides detailed information about the core concepts. We explore multiple dimensions of the topic, examining various perspectives and implications.",
          "paragraph"
        )
      ),
    ]),
    createRow([
      createBlockInstance(
        BLOCK_TYPES.PROSEMIRROR,
        createProseMirrorDoc(
          "Additional context and supporting details that influence outcomes and strategic direction.",
          "paragraph"
        )
      ),
    ]),
  ],
  accent: {
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1974&auto=format&fit=crop",
    position: "left",
    size: 28,
  },
};
