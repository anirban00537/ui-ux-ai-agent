import { lazy, ComponentType } from 'react';
import {
  IconPhoto,
  IconCode,
  IconSeparator,
  IconNote,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconClick,
  IconTimeline,
  IconLayersIntersect,
  IconPolygon,
  IconHeading,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconQuote,
  IconBoxModel,
  IconLayoutSidebarLeftCollapse,
  IconBadge,
  IconContrast,
} from "@tabler/icons-react";

import { BLOCK_TYPES, BlockType, BlockContent, getDefaultHeadingContent, Block } from "@/types";
import type { BlockRendererProps } from "@/app/(app)/(protected)/docs/[id]/engine/types";

// Import factories and normalizers directly
import { createImageContent, normalizeImageContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/image";
import { createCodeContent, normalizeCodeContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/code";
import { createSpacerContent, normalizeSpacerContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/spacer";
import { createSimpleNumberCardContent, normalizeSimpleNumberCardContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/simple-number-card";
import { createLayeredNumberContent, normalizeLayeredNumberContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/layered-number-block";
import { createCalloutContent, normalizeCalloutContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/callout-block";
import { createSolidBoxContent, normalizeSolidBoxContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/solid-box-block";
import { createSolidIconBoxContent, normalizeSolidIconBoxContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/solid-icon-box-block";
import { createSidelineCardContent, normalizeSidelineCardContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/sideline-card-block";
import { createButtonBlockContent, normalizeButtonBlockContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/button-block";
import { createLeafBlockContent, normalizeLeafBlockContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/leaf-block";
import { createTimelineBentoContent, normalizeTimelineBentoContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/timeline-bento-block";
import { createStackedTimelineContent, normalizeStackedTimelineContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/stacked-timeline-block";
import { createConnectedStepsContent, normalizeConnectedStepsContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/connected-steps-block";
import { createCircleStatsContent, normalizeCircleStatsContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/circle-stats-block";
import { createImageCardContent, normalizeImageCardContent } from "@/app/(app)/(protected)/docs/[id]/editor/blocks/definitions/image-card-block";

export interface BlockPreset {
  label: string;
  description: string;
  icon?: ComponentType<{ size?: number }>;
  createContent: () => BlockContent;
}

export interface BlockDefinition {
  type: BlockType;
  component: ComponentType<BlockRendererProps>;
  icon: ComponentType<{ size?: number }>;
  label: string;
  description: string;
  category: 'Core' | 'Callouts' | 'Cards & Boxes' | 'Interactive' | 'Format' | 'Data';
  createContent: () => BlockContent;
  normalizeContent: (content: unknown) => BlockContent;
  keywords?: string[];
  initialContent?: any; // For preset variations
  presets?: BlockPreset[];
}

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  [BLOCK_TYPES.PROSEMIRROR]: {
    type: BLOCK_TYPES.PROSEMIRROR,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/prosemirror/ProseMirrorBlock').then(m => ({ default: m.ProseMirrorBlock }))),
    icon: IconHeading,
    label: 'Text',
    description: 'Rich text with headings, lists, and formatting',
    category: 'Core',
    createContent: getDefaultHeadingContent,
    normalizeContent: (c) => (c && typeof c === 'object') ? c as BlockContent : getDefaultHeadingContent(),
    keywords: ['text', 'paragraph', 'heading', 'list'],
    presets: [
      {
        label: 'Heading 1',
        description: 'Large section heading',
        icon: IconH1,
        createContent: () => ({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Heading 1' }] }] }),
      },
      {
        label: 'Heading 2',
        description: 'Medium section heading',
        icon: IconH2,
        createContent: () => ({ type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Heading 2' }] }] }),
      },
      {
        label: 'Heading 3',
        description: 'Small section heading',
        icon: IconH3,
        createContent: () => ({ type: 'doc', content: [{ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Heading 3' }] }] }),
      },
      {
        label: 'Quote',
        description: 'Block quotation',
        icon: IconQuote,
        createContent: () => ({ type: 'doc', content: [{ type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Your quote here' }] }] }] }),
      },
    ],
  },

  [BLOCK_TYPES.IMAGE]: {
    type: BLOCK_TYPES.IMAGE,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/image/ImageBlock').then(m => ({ default: m.ImageBlock }))),
    icon: IconPhoto,
    label: 'Image',
    description: 'Upload or search for images',
    category: 'Core',
    createContent: createImageContent,
    normalizeContent: normalizeImageContent,
    keywords: ['photo', 'picture', 'upload', 'media'],
  },

  [BLOCK_TYPES.CODE]: {
    type: BLOCK_TYPES.CODE,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/code/CodeBlock').then(m => ({ default: m.CodeBlock }))),
    icon: IconCode,
    label: 'Code',
    description: 'Syntax-highlighted code snippets',
    category: 'Core',
    createContent: createCodeContent,
    normalizeContent: normalizeCodeContent,
    keywords: ['code', 'snippet', 'syntax', 'developer'],
  },

  [BLOCK_TYPES.SPACER]: {
    type: BLOCK_TYPES.SPACER,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/spacer/SpacerBlock').then(m => ({ default: m.SpacerBlock }))),
    icon: IconSeparator,
    label: 'Spacer',
    description: 'Adjustable vertical space',
    category: 'Format',
    createContent: createSpacerContent,
    normalizeContent: normalizeSpacerContent,
    keywords: ['space', 'gap', 'divider'],
  },

  [BLOCK_TYPES.CALLOUT_BLOCK]: {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/callout-block/CalloutBlock').then(m => ({ default: m.CalloutBlock }))),
    icon: IconInfoCircle,
    label: 'Callout',
    description: 'Highlighted box for emphasis',
    category: 'Callouts',
    createContent: () => createCalloutContent('info'),
    normalizeContent: normalizeCalloutContent,
    keywords: ['note', 'warning', 'info', 'alert', 'box'],
    presets: [
      {
         label: 'Note',
         description: 'Neutral note box',
         icon: IconNote,
         createContent: () => createCalloutContent('note'),
      },
      {
         label: 'Info',
         description: 'Blue info callout',
         icon: IconInfoCircle,
         createContent: () => createCalloutContent('info'),
      },
      {
         label: 'Warning',
         description: 'Yellow warning alert',
         icon: IconAlertTriangle,
         createContent: () => createCalloutContent('warning'),
      },
      {
         label: 'Error',
         description: 'Red error/caution',
         icon: IconAlertOctagon,
         createContent: () => createCalloutContent('error'),
      },
    ]
  },

  [BLOCK_TYPES.BUTTON_BLOCK]: {
    type: BLOCK_TYPES.BUTTON_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/button-block/ButtonBlock').then(m => ({ default: m.ButtonBlock }))),
    icon: IconClick,
    label: 'Button',
    description: 'Clickable button',
    category: 'Interactive',
    createContent: createButtonBlockContent,
    normalizeContent: normalizeButtonBlockContent,
    keywords: ['button', 'link', 'click', 'action'],
  },

  [BLOCK_TYPES.SIMPLE_NUMBER_CARD]: {
    type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/simple-number-card/SimpleNumberCardBlock').then(m => ({ default: m.SimpleNumberCardBlock }))),
    icon: IconBadge,
    label: 'Number Card',
    description: 'Big number with label',
    category: 'Data',
    createContent: createSimpleNumberCardContent,
    normalizeContent: normalizeSimpleNumberCardContent,
    keywords: ['number', 'stat', 'card', 'data'],
  },

  [BLOCK_TYPES.LAYERED_NUMBER_BLOCK]: {
    type: BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/layered-number-block/LayeredNumberBlock').then(m => ({ default: m.LayeredNumberBlock }))),
    icon: IconLayersIntersect,
    label: 'Layered Number',
    description: 'Stylish layered number display',
    category: 'Cards & Boxes',
    createContent: createLayeredNumberContent,
    normalizeContent: normalizeLayeredNumberContent,
    keywords: ['number', 'layer', 'depth'],
  },

  [BLOCK_TYPES.SOLID_BOX_BLOCK]: {
    type: BLOCK_TYPES.SOLID_BOX_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/solid-box-block/SolidBoxBlock').then(m => ({ default: m.SolidBoxBlock }))),
    icon: IconBoxModel,
    label: 'Solid Box',
    description: 'Colored box with content',
    category: 'Cards & Boxes',
    createContent: createSolidBoxContent,
    normalizeContent: normalizeSolidBoxContent,
    keywords: ['box', 'container', 'solid'],
  },

  [BLOCK_TYPES.SOLID_ICON_BOX_BLOCK]: {
    type: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/solid-icon-box-block/SolidIconBoxBlock').then(m => ({ default: m.SolidIconBoxBlock }))),
    icon: IconContrast,
    label: 'Icon Box',
    description: 'Box with an icon header',
    category: 'Cards & Boxes',
    createContent: createSolidIconBoxContent,
    normalizeContent: normalizeSolidIconBoxContent,
    keywords: ['box', 'icon', 'card'],
  },

  [BLOCK_TYPES.SIDELINE_CARD_BLOCK]: {
    type: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/sideline-card-block/SidelineCardBlock').then(m => ({ default: m.SidelineCardBlock }))),
    icon: IconLayoutSidebarLeftCollapse,
    label: 'Sideline Card',
    description: 'Card with side accent line',
    category: 'Cards & Boxes',
    createContent: createSidelineCardContent,
    normalizeContent: normalizeSidelineCardContent,
    keywords: ['card', 'line', 'accent'],
  },

  [BLOCK_TYPES.LEAF_BLOCK]: {
    type: BLOCK_TYPES.LEAF_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/leaf-block/LeafBlock').then(m => ({ default: m.LeafBlock }))),
    icon: IconPolygon,
    label: 'Leaf Grid',
    description: 'Grid of leaf-shaped cards',
    category: 'Cards & Boxes',
    createContent: createLeafBlockContent,
    normalizeContent: normalizeLeafBlockContent,
    keywords: ['grid', 'leaf', 'shape'],
  },

  [BLOCK_TYPES.TIMELINE_BENTO_BLOCK]: {
    type: BLOCK_TYPES.TIMELINE_BENTO_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/timeline-bento/TimelineBentoBlock').then(m => ({ default: m.TimelineBentoBlock }))),
    icon: IconTimeline,
    label: 'Timeline Bento',
    description: 'Alternating timeline layout',
    category: 'Cards & Boxes',
    createContent: createTimelineBentoContent,
    normalizeContent: normalizeTimelineBentoContent,
    keywords: ['timeline', 'process', 'steps'],
  },

  [BLOCK_TYPES.STACKED_TIMELINE_BLOCK]: {
    type: BLOCK_TYPES.STACKED_TIMELINE_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/stacked-timeline/StackedTimelineBlock').then(m => ({ default: m.StackedTimelineBlock }))),
    icon: IconLayersIntersect,
    label: 'Stacked Timeline',
    description: 'Vertical stacked timeline',
    category: 'Cards & Boxes',
    createContent: createStackedTimelineContent,
    normalizeContent: normalizeStackedTimelineContent,
    keywords: ['timeline', 'stack', 'vertical'],
  },

  [BLOCK_TYPES.CONNECTED_STEPS_BLOCK]: {
    type: BLOCK_TYPES.CONNECTED_STEPS_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/connected-steps/ConnectedStepsBlock').then(m => ({ default: m.ConnectedStepsBlock }))),
    icon: IconTimeline, // Reusing timeline icon for steps
    label: 'Connected Steps',
    description: 'Points connected by a line',
    category: 'Cards & Boxes',
    createContent: createConnectedStepsContent,
    normalizeContent: normalizeConnectedStepsContent,
    keywords: ['steps', 'process', 'connect'],
  },

  [BLOCK_TYPES.CIRCLE_STATS_BLOCK]: {
    type: BLOCK_TYPES.CIRCLE_STATS_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/circle-stats/CircleStatsBlock').then(m => ({ default: m.CircleStatsBlock }))),
    icon: IconBadge, // Reusing badge
    label: 'Circle Stats',
    description: 'Circular statistics display',
    category: 'Data',
    createContent: createCircleStatsContent,
    normalizeContent: normalizeCircleStatsContent,
    keywords: ['stats', 'circle', 'data', 'percentage'],
  },

  [BLOCK_TYPES.IMAGE_CARD_BLOCK]: {
    type: BLOCK_TYPES.IMAGE_CARD_BLOCK,
    component: lazy(() => import('@/app/(app)/(protected)/docs/[id]/editor/blocks/image-card/ImageCardBlock').then(m => ({ default: m.ImageCardBlock }))),
    icon: IconPhoto,
    label: 'Image Card',
    description: 'Image cards with title and description',
    category: 'Cards & Boxes',
    createContent: createImageCardContent,
    normalizeContent: normalizeImageCardContent,
    keywords: ['image', 'card', 'photo', 'gallery', 'picture'],
  },
};
