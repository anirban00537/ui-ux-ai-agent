import { z } from "zod";

// --- Base Types ---

export const ProseMirrorDocObjectSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.any()).optional(),
}).passthrough();

export const ProseMirrorDocumentSchema = z.union([z.string(), ProseMirrorDocObjectSchema]);

// --- Block Content Schemas ---

export const CodeContentSchema = z.object({
  type: z.literal("code"),
  code: z.string(),
  language: z.string().optional(),
  showLineNumbers: z.boolean().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const ImageContentSchema = z.object({
  type: z.literal("image"),
  imageUrl: z.string(),
  imageQuery: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  attribution: z.object({
    name: z.string(),
    link: z.string().url(),
  }).optional(),
  objectFit: z.enum(["cover", "contain", "fill"]).optional(),
});

export const SpacerContentSchema = z.object({
  type: z.literal("spacer"),
  height: z.number(),
});

export const SimpleNumberCardItemSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const SimpleNumberCardContentSchema = z.object({
  type: z.literal("simple-number-card"),
  items: z.array(SimpleNumberCardItemSchema).default([]),
});
export type SimpleNumberCardItem = z.infer<typeof SimpleNumberCardItemSchema>;
export type SimpleNumberCardContent = z.infer<typeof SimpleNumberCardContentSchema>;

export const LayeredNumberItemSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const LayeredNumberContentSchema = z.object({
  type: z.literal("layered-number-block"),
  items: z.array(LayeredNumberItemSchema).default([]),
});
export type LayeredNumberItem = z.infer<typeof LayeredNumberItemSchema>;
export type LayeredNumberContent = z.infer<typeof LayeredNumberContentSchema>;

export const CalloutContentSchema = z.object({
  type: z.literal("callout-block"),
  variant: z.enum(["note", "info", "warning", "error", "success", "question"]),
  editorContent: ProseMirrorDocumentSchema,
});

export const SolidBoxItemSchema = z.object({
  id: z.string(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const SolidBoxContentSchema = z.object({
  type: z.literal("solid-box-block"),
  items: z.array(SolidBoxItemSchema).default([]),
});
export type SolidBoxItem = z.infer<typeof SolidBoxItemSchema>;
export type SolidBoxContent = z.infer<typeof SolidBoxContentSchema>;

export const SolidIconBoxItemSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const SolidIconBoxContentSchema = z.object({
  type: z.literal("solid-icon-box-block"),
  items: z.array(SolidIconBoxItemSchema).default([]),
});
export type SolidIconBoxItem = z.infer<typeof SolidIconBoxItemSchema>;
export type SolidIconBoxContent = z.infer<typeof SolidIconBoxContentSchema>;

export const SidelineCardItemSchema = z.object({
  id: z.string(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const SidelineCardContentSchema = z.object({
  type: z.literal("sideline-card-block"),
  items: z.array(SidelineCardItemSchema).default([]),
});
export type SidelineCardItem = z.infer<typeof SidelineCardItemSchema>;
export type SidelineCardContent = z.infer<typeof SidelineCardContentSchema>;
export const ButtonBlockContentSchema = z.object({
  type: z.literal("button-block"),
  text: z.string().default("Click here"),
  link: z.string().optional(),
  style: z.enum(["filled", "outline"]).default("filled"),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  color: z.string().default("default"),
});
export type ButtonBlockContent = z.infer<typeof ButtonBlockContentSchema>;

export const LeafItemSchema = z.object({
  id: z.string(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const LeafBlockContentSchema = z.object({
  type: z.literal("leaf-block"),
  items: z.array(LeafItemSchema).default([]),
});
export type LeafItem = z.infer<typeof LeafItemSchema>;
export type LeafBlockContent = z.infer<typeof LeafBlockContentSchema>;

// Timeline Bento Block
export const TimelineBentoItemSchema = z.object({
  id: z.string(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const TimelineBentoContentSchema = z.object({
  type: z.literal("timeline-bento-block"),
  items: z.array(TimelineBentoItemSchema).default([]),
});

export type TimelineBentoItem = z.infer<typeof TimelineBentoItemSchema>;
export type TimelineBentoContent = z.infer<typeof TimelineBentoContentSchema>;

// Stacked Timeline Block
export const StackedTimelineItemSchema = z.object({
  id: z.string(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const StackedTimelineContentSchema = z.object({
  type: z.literal("stacked-timeline-block"),
  items: z.array(StackedTimelineItemSchema).default([]),
});

export type StackedTimelineItem = z.infer<typeof StackedTimelineItemSchema>;
export type StackedTimelineContent = z.infer<typeof StackedTimelineContentSchema>;

// Connected Steps Block
export const ConnectedStepsItemSchema = z.object({
  id: z.string(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const ConnectedStepsContentSchema = z.object({
  type: z.literal("connected-steps-block"),
  items: z.array(ConnectedStepsItemSchema).default([]),
});

export type ConnectedStepsItem = z.infer<typeof ConnectedStepsItemSchema>;
export type ConnectedStepsContent = z.infer<typeof ConnectedStepsContentSchema>;

// Circle Stats Block
export const CircleStatsItemSchema = z.object({
  id: z.string(),
  value: z.number().min(0).max(100).default(0),
  suffix: z.string().optional().default("%"),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const CircleStatsContentSchema = z.object({
  type: z.literal("circle-stats-block"),
  items: z.array(CircleStatsItemSchema).default([]),
});

export type CircleStatsItem = z.infer<typeof CircleStatsItemSchema>;
export type CircleStatsContent = z.infer<typeof CircleStatsContentSchema>;

// Image Card Block
export const ImageCardItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string().default(""),
  imageQuery: z.string().optional(),
  imageAlt: z.string().optional().default(""),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
  objectFit: z.enum(["cover", "contain", "fill"]).default("cover"),
  attribution: z.object({
    name: z.string(),
    link: z.string().url(),
  }).optional(),
});

export const ImageCardContentSchema = z.object({
  type: z.literal("image-card-block"),
  items: z.array(ImageCardItemSchema).default([]),
});
export type ImageCardItem = z.infer<typeof ImageCardItemSchema>;
export type ImageCardContent = z.infer<typeof ImageCardContentSchema>;

export const BlockContentSchema = z.union([
  z.string(),
  ProseMirrorDocObjectSchema,
  ImageContentSchema,
  CodeContentSchema,
  SimpleNumberCardContentSchema,
  LayeredNumberContentSchema,
  CalloutContentSchema,
  SolidBoxContentSchema,
  SolidIconBoxContentSchema,
  SidelineCardContentSchema,
  ButtonBlockContentSchema,
  LeafBlockContentSchema,
  TimelineBentoContentSchema,
  StackedTimelineContentSchema,
  ConnectedStepsContentSchema,
  CircleStatsContentSchema,
  ImageCardContentSchema,
  SpacerContentSchema,
]);


// Utilities
export const getDefaultHeadingContent = (): any => createProseMirrorDoc("", "heading", 3);

export const createProseMirrorDoc = (text: string, type: 'paragraph' | 'heading' = 'paragraph', level: number = 1) => {
  if (type === 'heading') {
    return {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level },
          content: [
            {
              type: 'text',
              text,
            },
          ],
        },
      ],
    };
  }
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text,
          },
        ],
      },
    ],
  };
};

export const withAlpha = (color: string, opacity: number): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};
