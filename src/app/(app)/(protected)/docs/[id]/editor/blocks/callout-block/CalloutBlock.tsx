import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types";
import {
  createCalloutContent,
} from "../definitions/callout-block";
import type { CalloutContent } from "@/types";
import { 
  IconInfoCircle, 
  IconAlertTriangle, 
  IconAlertOctagon, 
  IconNote,
  IconCheck,
  IconHelpCircle
} from "@tabler/icons-react";

interface CalloutBlockProps {
  block: Block;
  onUpdate: (content: CalloutContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

const VARIANTS = {
    note: { icon: IconNote, color: "neutral", label: "Note" },
    info: { icon: IconInfoCircle, color: "blue", label: "Info" },
    warning: { icon: IconAlertTriangle, color: "amber", label: "Warning" },
    error: { icon: IconAlertOctagon, color: "red", label: "Caution" },
    success: { icon: IconCheck, color: "green", label: "Success" },
    question: { icon: IconHelpCircle, color: "purple", label: "Question" },
} as const;

export const CalloutBlock = memo(function CalloutBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: CalloutBlockProps) {
  const content = block.content as CalloutContent;
  const variant = content?.variant ?? "note";
  const def = VARIANTS[variant] || VARIANTS.note;
  const Icon = def.icon;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createCalloutContent(variant).editorContent;
  }, [content?.editorContent, variant]);

  // Determine colors based on variant and theme
  const getStyle = () => {
    // Check if we are in dark mode
    const isDark = theme.themeType === 'dark';

    if (isDark) {
        switch (variant) {
            case 'info': return { bg: 'rgba(30, 58, 138, 0.5)', border: '#60a5fa', text: '#ffffff', icon: '#93c5fd' }; 
            case 'warning': return { bg: 'rgba(120, 53, 15, 0.5)', border: '#fbbf24', text: '#ffffff', icon: '#fcd34d' }; 
            case 'error': return { bg: 'rgba(127, 29, 29, 0.5)', border: '#f87171', text: '#ffffff', icon: '#fca5a5' }; 
            case 'success': return { bg: 'rgba(20, 83, 45, 0.5)', border: '#4ade80', text: '#ffffff', icon: '#86efac' }; 
            case 'question': return { bg: 'rgba(88, 28, 135, 0.5)', border: '#c084fc', text: '#ffffff', icon: '#d8b4fe' }; 
            case 'note': default: return { bg: 'rgba(51, 65, 85, 0.5)', border: '#94a3b8', text: '#ffffff', icon: '#cbd5e1' };
        }
    }

    // Light mode colors - Saturated backgrounds
    switch (variant) {
        case 'info': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a', icon: '#2563eb' };
        case 'warning': return { bg: '#fef3c7', border: '#f59e0b', text: '#78350f', icon: '#d97706' };
        case 'error': return { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d', icon: '#dc2626' };
        case 'success': return { bg: '#dcfce7', border: '#22c55e', text: '#14532d', icon: '#16a34a' };
        case 'question': return { bg: '#f3e8ff', border: '#a855f7', text: '#581c87', icon: '#9333ea' };
        case 'note': default: return { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155', icon: '#64748b' };
    }
  };

  const colors = getStyle();

  const customTheme = useMemo(() => {
    return {
       ...theme,
       bodyColor: theme.themeType === 'dark' && variant !== 'note' ? '#ffffff' : theme.bodyColor
    };
  }, [theme, variant]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "callout-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );
  
  // Allow cycling variants on click of icon? Maybe later.

  return (
    <div
      className="w-full transition-all duration-300"
      style={{
          borderRadius: theme.cardBorderRadius ?? "12px",
          backgroundColor: colors.bg,
      }}
    >
      <div className="flex flex-row items-center w-full py-3 px-3 gap-2">
         {/* Icon Section - Centered Vertically on the Left */}
         <div className="shrink-0 flex items-center justify-center">
            <Icon size={18} color={colors.icon} stroke={2.5} />
         </div>

        {/* Content Area - Zero internal margins */}
        <div className="flex-1 min-w-0">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type notice..."}
            className="prose-none"
            readOnly={readOnly}
            theme={customTheme} 
          />
          {/* Style Override for ProseMirror to enforce zero space and centered text */}
          <style jsx global>{`
              #block-${block.id} .ProseMirror {
                  min-height: auto !important;
                  padding: 0 !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: center !important;
              }
              #block-${block.id} .ProseMirror p,
              #block-${block.id} .ProseMirror h1, 
              #block-${block.id} .ProseMirror h2, 
              #block-${block.id} .ProseMirror h3,
              #block-${block.id} .ProseMirror ul,
              #block-${block.id} .ProseMirror ol {
                  margin: 0 !important;
                  padding: 0 !important;
                  font-size: 0.875rem !important;
                  line-height: 1.25 !important;
                  color: ${colors.text} !important;
              }
              #block-${block.id} .ProseMirror h1, 
              #block-${block.id} .ProseMirror h2, 
              #block-${block.id} .ProseMirror h3 {
                  font-weight: 600 !important;
                  font-size: 0.9rem !important;
              }
              #block-${block.id} .ProseMirror strong {
                  color: ${colors.text} !important;
              }
              /* Placeholder compact */
              #block-${block.id} .ProseMirror p.is-empty::before {
                  color: ${colors.text}80 !important;
                  font-size: 0.875rem !important;
                  margin: 0 !important;
              }
          `}</style>
        </div>
      </div>
    </div>
  );
});
