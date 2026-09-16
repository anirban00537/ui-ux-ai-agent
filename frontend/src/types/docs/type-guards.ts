/**
 * Type guards for discriminated union block content types
 * These provide type-safe runtime checks for block content
 */

import type {
  BlockContent,
  CodeContent,
  ImageContent,
  SimpleNumberCardContent,
  LayeredNumberContent,
  CalloutContent,
  SpacerContent,
  ProseMirrorDocument,
} from "./schemas";

// Type guard for string content (ProseMirror markdown) or JSON doc
export const isProseMirrorDocument = (
  content: BlockContent
): content is ProseMirrorDocument => {
  return typeof content === "string" || (typeof content === "object" && content !== null && "type" in content && content.type === "doc");
};

// Type guard helper for checking object content type discriminator
const hasType = (
  content: BlockContent,
  type: string
): boolean => {
  return (
    typeof content === "object" &&
    content !== null &&
    "type" in content &&
    content.type === type
  );
};

// Individual type guards for each block content type
export const isCodeContent = (content: BlockContent): content is CodeContent =>
  hasType(content, "code");

export const isImageContent = (
  content: BlockContent
): content is ImageContent => hasType(content, "image");

export const isSimpleNumberCardContent = (
  content: BlockContent
): content is SimpleNumberCardContent => hasType(content, "simple-number-card");

export const isLayeredNumberContent = (
  content: BlockContent
): content is LayeredNumberContent => hasType(content, "layered-number-block");

export const isCalloutContent = (
  content: BlockContent
): content is CalloutContent => hasType(content, "callout-block");

export const isSpacerContent = (
  content: BlockContent
): content is SpacerContent => hasType(content, "spacer");

/**
 * Get the block content type discriminator
 * Returns the type string for objects or 'prosemirror' for string content
 */
export const getBlockContentType = (
  content: BlockContent
): string => {
  if (typeof content === "string") {
    return "prosemirror";
  }
  if (
    typeof content === "object" &&
    content !== null &&
    "type" in content &&
    typeof content.type === "string"
  ) {
    if (content.type === "doc") return "prosemirror";
    return content.type;
  }
  return "unknown";
};
