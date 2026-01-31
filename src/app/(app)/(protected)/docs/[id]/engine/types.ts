import type { Block, BlockContent, Theme } from "@/types";

export interface BlockRendererProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
  isStreaming?: boolean;
}
