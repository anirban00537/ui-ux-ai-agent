import { nanoid } from "nanoid";
import {
  type Block,
  type Row,
  type Card,
  BLOCK_TYPES,
  MAX_BLOCKS_PER_ROW,
  type BlockType,
} from "@/types";
import { BLOCK_DEFINITIONS } from "./block-definitions";

export const createBlockInstance = (
  type: BlockType = BLOCK_TYPES.PROSEMIRROR,
  content?: any
): Block => {
  const definition = BLOCK_DEFINITIONS[type] || BLOCK_DEFINITIONS[BLOCK_TYPES.PROSEMIRROR];
 return {
  id: nanoid(),
  type,
  content: content ?? definition.createContent(),
 };
};

export const createRow = (blocks?: Block[]): Row => {
  const rowBlocks = blocks?.length ? blocks : [createBlockInstance()];
  // Initialize equal column widths as fractional units (fr) for CSS Grid
  const columnWidths = rowBlocks.map(() => 1);
  return {
    id: nanoid(),
    blocks: rowBlocks,
    columnWidths,
  };
};

export const createRowWithColumns = (
  columnCount: number,
  blockType?: BlockType,
  initialContent?: any
): Row => {
  const blocks: Block[] = [];
  for (let i = 0; i < columnCount; i++) {
    blocks.push(createBlockInstance(blockType, initialContent));
  }
  return createRow(blocks);
};

export const createCard = (): Card => ({
  id: nanoid(),
  rows: [createRow()],
});
