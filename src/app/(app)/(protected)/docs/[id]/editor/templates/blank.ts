import { BLOCK_TYPES } from "../blocks/definitions";
import { createBlockInstance, createRow } from "@/app/(app)/(protected)/docs/[id]/engine/registry/factories";
import { Card } from "@/store/slices/cardsSlice";

export const blankTemplate: Card = {
  id: "blank",
  rows: [
    createRow([
      createBlockInstance(BLOCK_TYPES.PROSEMIRROR, ""),
    ]),
  ],
};
