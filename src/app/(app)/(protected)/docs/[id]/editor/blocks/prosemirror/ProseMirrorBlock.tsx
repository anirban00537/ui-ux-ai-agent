import React, { memo, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, BlockContent } from "@/types";
import { isProseMirrorDocument } from "@/types";

interface ProseMirrorBlockProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  placeholder?: string;
  theme?: Theme;
  readOnly?: boolean;
}

export const ProseMirrorBlock = memo(function ProseMirrorBlock({
  block,
  onUpdate,
  placeholder = "Type '/' for commands",
  readOnly,
  theme,
}: ProseMirrorBlockProps) {
  // The onUpdate expects BlockContent, and ProseMirrorDocument (string or JSON) is valid BlockContent
  const handleChange = useCallback((content: any) => {
    onUpdate(content);
  }, [onUpdate]);

  // Use type guard to safely get string content, or fallback to empty string
  const value = isProseMirrorDocument(block.content) ? block.content : "";

  return (
    <div className="w-full h-full flex flex-col p-1">
      <ProseMirrorEditor
        key={block.id}
        blockId={block.id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1"
        readOnly={readOnly}
        theme={theme}
      />
    </div>
  );
});
