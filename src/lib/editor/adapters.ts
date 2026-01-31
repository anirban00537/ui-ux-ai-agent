import type { Card as ReduxCard, Block, Row } from "@/types";
import { BLOCK_TYPES } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions";

/**
 * Migration helper for block content. 
 * Now that we support both Markdown and original ProseMirror JSON, 
 * we mostly preserve the content as-is.
 */
function migrateBlockContent(block: Block): Block {
  // If it's a ProseMirror block, we now accept both string (markdown) and object (JSON)
  // No forced conversion is needed anymore.
  return block;
}

/**
 * Recursively migrate all blocks in a row
 */
function migrateRow(row: Row): Row {
  return {
    ...row,
    blocks: Array.isArray(row.blocks) ? row.blocks.map(migrateBlockContent) : [],
  };
}

/**
 * Convert API card format to Redux format, migrating legacy ProseMirror JSON to Markdown
 */
export const convertApiCardToRedux = (apiCard: any): ReduxCard => {
  const rows = (apiCard.data?.rows || []).map(migrateRow);
  return {
    id: apiCard.id,
    rows,
    accent: apiCard.data?.accent,
    isStreaming: false, // Explicitly set for export context
  };
};

/**
 * Convert Redux card format to API format
 * Note: Content is already in Markdown format at this point, so no conversion needed
 */
export const convertReduxCardToApi = (reduxCard: ReduxCard): any => ({
  data: {
    rows: reduxCard.rows,
    accent: reduxCard.accent,
  },
});
