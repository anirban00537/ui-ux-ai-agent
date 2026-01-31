import { CalloutContentSchema, type CalloutContent, type ProseMirrorDocument, createProseMirrorDoc } from "@/types";

export const getDefaultCalloutEditorContent = (variant: string): ProseMirrorDocument => {
  switch(variant) {
    case 'info': return createProseMirrorDoc("Here is some helpful information or context relating to this card.") as any;
    case 'warning': return createProseMirrorDoc("Be mindful of this potential pitfall or important requirement.") as any;
    case 'error': return createProseMirrorDoc("PAY ATTENTION: This is a critical error or destructive action warning.") as any;
    case 'success': return createProseMirrorDoc("Great job! This indicates a successful outcome or completed step.") as any;
    case 'question': return createProseMirrorDoc("What are the main implications of this strategy?") as any;
    case 'note':
    default: return createProseMirrorDoc("Just a quick note to remember for later.") as any;
  }
};

export const createCalloutContent = (variant: CalloutContent['variant'] = "note"): CalloutContent => ({
  type: "callout-block",
  variant,
  editorContent: getDefaultCalloutEditorContent(variant),
});

export const normalizeCalloutContent = (content: any): CalloutContent => {
  if (!content || typeof content !== "object") return createCalloutContent("note");

  const isDoc = content.editorContent && typeof content.editorContent === 'object' && content.editorContent.type === 'doc';
  
  const editorContent = isDoc
    ? content.editorContent
    : typeof content.editorContent === "string"
    ? content.editorContent
    : getDefaultCalloutEditorContent(content.variant);

  const result = CalloutContentSchema.safeParse({
    ...content,
    editorContent,
  });

  if (result.success) {
    return result.data;
  }

  return createCalloutContent(content?.variant);
};
