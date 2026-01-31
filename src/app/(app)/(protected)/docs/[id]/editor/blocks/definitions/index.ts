import { BlockType, BlockContent, BLOCK_TYPES, getDefaultHeadingContent } from "@/types";

// Export everything from types
export * from "@/types";

// Individual block definitions (Only keeping the ones to stay)
import { createImageContent, normalizeImageContent } from "./image";
import { createCodeContent, normalizeCodeContent } from "./code";
import { createSpacerContent, normalizeSpacerContent } from "./spacer";
import { createSimpleNumberCardContent, normalizeSimpleNumberCardContent } from "./simple-number-card";
import { createLayeredNumberContent, normalizeLayeredNumberContent } from "./layered-number-block";
import { createCalloutContent, normalizeCalloutContent } from "./callout-block";
import { createSolidBoxContent, normalizeSolidBoxContent } from "./solid-box-block";
import { createSolidIconBoxContent, normalizeSolidIconBoxContent } from "./solid-icon-box-block";
import { createSidelineCardContent, normalizeSidelineCardContent } from "./sideline-card-block";

import { createButtonBlockContent, normalizeButtonBlockContent } from "./button-block";
import { createLeafBlockContent, normalizeLeafBlockContent } from "./leaf-block";
import { createTimelineBentoContent, normalizeTimelineBentoContent } from "./timeline-bento-block";
import { createStackedTimelineContent, normalizeStackedTimelineContent } from "./stacked-timeline-block";
import { createConnectedStepsContent, normalizeConnectedStepsContent } from "./connected-steps-block";
import { createCircleStatsContent, normalizeCircleStatsContent } from "./circle-stats-block";
import { createImageCardContent, normalizeImageCardContent } from "./image-card-block";


// Re-export factories and normalizers
export {
  createImageContent, normalizeImageContent,
  createCodeContent, normalizeCodeContent,
  createSpacerContent, normalizeSpacerContent,
  createSimpleNumberCardContent, normalizeSimpleNumberCardContent,
  createLayeredNumberContent, normalizeLayeredNumberContent,
  createCalloutContent, normalizeCalloutContent,
  createSolidBoxContent, normalizeSolidBoxContent,
  createSolidIconBoxContent, normalizeSolidIconBoxContent,
  createSidelineCardContent, normalizeSidelineCardContent,
  createButtonBlockContent, normalizeButtonBlockContent,
  createLeafBlockContent, normalizeLeafBlockContent,
  createTimelineBentoContent, normalizeTimelineBentoContent,
  createStackedTimelineContent, normalizeStackedTimelineContent,
  createConnectedStepsContent, normalizeConnectedStepsContent,
  createCircleStatsContent, normalizeCircleStatsContent,
  createImageCardContent, normalizeImageCardContent,
};



