"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownReaderProps {
  content: string;
  className?: string;
}

export function MarkdownReader({ content, className }: MarkdownReaderProps) {
  return (
    <div className={cn("prose prose-slate max-w-none dark:prose-invert", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
