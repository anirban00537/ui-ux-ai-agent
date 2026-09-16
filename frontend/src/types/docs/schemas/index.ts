import { z } from "zod";

export * from "./blocks";
export * from "./core";
export * from "./theme";

import {
  CodeContentSchema,
  ImageContentSchema,
  SpacerContentSchema,
  BlockContentSchema,
  ProseMirrorDocumentSchema,
  SimpleNumberCardContentSchema,
  LayeredNumberContentSchema,
  CalloutContentSchema,
} from "./blocks";

import {
  BlockSchema,
  RowSchema,
  CardSchema,
  DocInfoSchema,
  BlockTypeSchema,
  CardAccentSchema,
  DocTypeSchema,
} from "./core";

import { ThemeSchema, CardDesignPatternSchema } from "./theme";

// Infer types
export type ProseMirrorDocument = z.infer<typeof ProseMirrorDocumentSchema>;
export type CodeContent = z.infer<typeof CodeContentSchema>;
export type ImageContent = z.infer<typeof ImageContentSchema>;
export type SpacerContent = z.infer<typeof SpacerContentSchema>;
export type SimpleNumberCardContent = z.infer<typeof SimpleNumberCardContentSchema>;
export type LayeredNumberContent = z.infer<typeof LayeredNumberContentSchema>;
export type CalloutContent = z.infer<typeof CalloutContentSchema>;

export type LayoutTemplate = {
  id: string;
  name: string;
  description?: string;
  icon?: string | any;
  tags?: string[];
  type?: 'admin' | 'user';
  thumbnail?: string;
  data: {
    rows: Row[];
    accent?: CardAccent;
    icon?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type BlockContent = z.infer<typeof BlockContentSchema>;

export type BlockType = z.infer<typeof BlockTypeSchema>;
export type Block<T = BlockContent> = {
  id: string;
  type?: BlockType;
  content: T;
};

export type Row = z.infer<typeof RowSchema>;
export type Card = z.infer<typeof CardSchema>;
export type CardAccent = z.infer<typeof CardAccentSchema>;
export type DocInfo = z.infer<typeof DocInfoSchema>;

export type Theme = z.infer<typeof ThemeSchema>;
export type CardDesignPattern = z.infer<typeof CardDesignPatternSchema>;
export type DocType = z.infer<typeof DocTypeSchema>;

export { getDefaultHeadingContent, withAlpha } from "./blocks";
export { BLOCK_TYPES, MAX_BLOCKS_PER_ROW, DOC_TYPES } from "./core";
export * from "../type-guards";
