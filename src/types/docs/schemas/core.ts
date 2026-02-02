import { z } from "zod";
import { BlockContentSchema } from "./blocks";

export const BLOCK_TYPES = {
  PROSEMIRROR: "prosemirror",
  IMAGE: "image",
  CODE: "code",
  SPACER: "spacer",
  SIMPLE_NUMBER_CARD: "simple-number-card",
  LAYERED_NUMBER_BLOCK: "layered-number-block",
  CALLOUT_BLOCK: "callout-block",
  SOLID_BOX_BLOCK: "solid-box-block",
  SOLID_ICON_BOX_BLOCK: "solid-icon-box-block",
  SIDELINE_CARD_BLOCK: "sideline-card-block",
  BUTTON_BLOCK: "button-block",
  LEAF_BLOCK: "leaf-block",
  TIMELINE_BENTO_BLOCK: "timeline-bento-block",
  STACKED_TIMELINE_BLOCK: "stacked-timeline-block",
  CONNECTED_STEPS_BLOCK: "connected-steps-block",
  CIRCLE_STATS_BLOCK: "circle-stats-block",
  IMAGE_CARD_BLOCK: "image-card-block",
} as const;

// Supported document types
export const DOC_TYPES = {
  MOBILE_APP: "mobile_app",
  CAROUSEL: "carousel",
  RESUME: "resume",
  INFOGRAPHIC: "infographic",
  REPORT: "report",
} as const;

export const DocTypeSchema = z.enum([
  DOC_TYPES.MOBILE_APP,
  DOC_TYPES.CAROUSEL,
  DOC_TYPES.RESUME,
  DOC_TYPES.INFOGRAPHIC,
  DOC_TYPES.REPORT,
]);

export const MAX_BLOCKS_PER_ROW = 3;

export const BlockTypeSchema = z.nativeEnum(BLOCK_TYPES);

export const BlockSchema = z.object({
  id: z.string(),
  type: BlockTypeSchema.optional(),
  content: BlockContentSchema,
});

export const RowSchema = z.object({
  id: z.string(),
  blocks: z.array(BlockSchema),
  columnWidths: z.array(z.number()).optional(),
});

export const CardAccentSchema = z.object({
  imageUrl: z.string().optional(),
  imageQuery: z.string().optional(),
  position: z.enum(["left", "right", "top", "bottom", "background"]),
  size: z.number().min(5).max(100), // width/height percentage, or opacity for background
});

export const CardSchema = z.object({
  id: z.string(),
  rows: z.array(RowSchema),
  accent: CardAccentSchema.optional(),
  isStreaming: z.boolean().optional(),
});

export const DocInfoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  docType: DocTypeSchema.default(DOC_TYPES.MOBILE_APP),
  isPublic: z.boolean(),
  isTemplate: z.boolean(),
  tags: z.array(z.string()),
  version: z.number(),
  parentId: z.string().nullable(),
  forkedFrom: z.string().nullable(),
  sharedWith: z.array(z.string()),
  ownerId: z.string(),
  shareEnabled: z.boolean().optional(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastViewedAt: z.string().nullable(),
  // Outline fields
  prompt: z.string().nullable().optional(),
  numberOfCards: z.number().nullable().optional(),
  outlineStatus: z.enum(["none", "generating", "completed", "failed"]).nullable().optional(),
  // Ownership flag - indicates if current user owns this doc (can edit)
  isOwner: z.boolean().optional(),
});
