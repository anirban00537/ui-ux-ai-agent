import { OpenRouter } from '@openrouter/sdk';
import { PromptTemplate } from '@langchain/core/prompts';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  type ScreenPlan,
  type SingleScreen,
  type ScreenPromptData,
  type ExistingScreen,
  type ColorPalette,
} from '../../schemas';
import { CreditManager } from '../credit-manager';
import { coreConstant } from '../../../../shared/helpers/coreConstant';
import { AiUsageService } from '../../../subscription/services/ai-usage.service';

// JSON Schema for ScreenPlan (replaces Zod schema)
const screenPlanJsonSchema = {
  type: 'object',
  properties: {
    totalScreens: {
      type: 'number',
      minimum: 1,
      maximum: 8,
      description: 'Total number of screens needed',
    },
    screenPrompts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Screen title',
          },
          prompt: {
            type: 'string',
            description: 'Detailed prompt for generating this specific screen',
          },
          order: {
            type: 'number',
            description: 'Order of screen generation',
          },
        },
        required: ['title', 'prompt', 'order'],
        additionalProperties: false,
      },
      description: 'Individual prompts for each screen',
    },
  },
  required: ['totalScreens', 'screenPrompts'],
  additionalProperties: false,
};

// JSON Schema for SingleScreen (replaces Zod schema)
const singleScreenJsonSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'A concise title for the mobile screen',
    },
    description: {
      type: 'string',
      description: "A brief description of the screen's purpose and functionality",
    },
    html: {
      type: 'string',
      description: 'Complete HTML code for the mobile screen',
    },
  },
  required: ['title', 'description', 'html'],
  additionalProperties: false,
};

import { screen1HTML } from '../../demo-screens/screen-1';
import { screen2HTML } from '../../demo-screens/screen-2';
import { screen3HTML } from '../../demo-screens/screen-3';
import { screen4HTML } from '../../demo-screens/screen-4';

const generateColorPaletteInstructions = (
  colorPalette?: ColorPalette | null,
): string => {
  if (!colorPalette) {
    return `COLOR PALETTE: Use default Tailwind colors with good contrast and accessibility.`;
  }

  return `COLOR PALETTE (STRICT ADHERENCE REQUIRED):
Use ONLY these specific colors from the conversation's color palette:

PRIMARY COLORS:
- Primary: ${
    colorPalette.primary
  } (use for main CTAs, primary buttons, key highlights)
${
  colorPalette.primaryLight
    ? `- Primary Light: ${colorPalette.primaryLight} (use for hover states, light backgrounds)`
    : ''
}
${
  colorPalette.primaryDark
    ? `- Primary Dark: ${colorPalette.primaryDark} (use for active states, emphasis)`
    : ''
}
${
  colorPalette.secondary
    ? `- Secondary: ${colorPalette.secondary} (use for secondary actions, complementary elements)`
    : ''
}
${
  colorPalette.accent
    ? `- Accent: ${colorPalette.accent} (use for highlights, notifications, special elements)`
    : ''
}

BACKGROUND & SURFACE:
- Background: ${colorPalette.background} (main app background)
${
  colorPalette.backgroundSecondary
    ? `- Background Secondary: ${colorPalette.backgroundSecondary} (secondary backgrounds)`
    : ''
}
- Surface: ${colorPalette.surface} (cards, containers, elevated surfaces)
${
  colorPalette.surfaceSecondary
    ? `- Surface Secondary: ${colorPalette.surfaceSecondary} (secondary surfaces)`
    : ''
}

TEXT COLORS:
- Text Primary: ${colorPalette.textPrimary} (main text, headings)
- Text Secondary: ${colorPalette.textSecondary} (secondary text, descriptions)
${
  colorPalette.textMuted
    ? `- Text Muted: ${colorPalette.textMuted} (muted text, placeholders)`
    : ''
}

BORDERS & STATES:
${
  colorPalette.border
    ? `- Border: ${colorPalette.border} (main borders, dividers)`
    : ''
}
${
  colorPalette.borderLight
    ? `- Border Light: ${colorPalette.borderLight} (subtle borders)`
    : ''
}
${
  colorPalette.success
    ? `- Success: ${colorPalette.success} (success states, confirmations)`
    : ''
}
${
  colorPalette.warning
    ? `- Warning: ${colorPalette.warning} (warning states, cautions)`
    : ''
}
${
  colorPalette.error
    ? `- Error: ${colorPalette.error} (error states, destructive actions)`
    : ''
}
${
  colorPalette.info
    ? `- Info: ${colorPalette.info} (info states, neutral notifications)`
    : ''
}

IMPLEMENTATION RULES:
- Convert hex colors to appropriate Tailwind classes or use arbitrary values like bg-[${
    colorPalette.primary
  }]
- Maintain proper contrast ratios (4.5:1 minimum for text)
- Use the palette consistently across all UI elements
- Do not deviate from these colors unless absolutely necessary for accessibility`;
};

// ==========================
// Demo Screen Design Inspiration
// ==========================

const demoScreensContext =
  `DESIGN INSPIRATION EXAMPLES:
Study these professional mobile screen designs to understand world-class UI/UX patterns. Learn WHY each design choice works, then create original screens that match or exceed this quality level.

EXAMPLE 1 - Gallery Home Screen:
` +
  screen1HTML.replace(/[{}]/g, '') +
  `
[Design Pattern Analysis]
✓ WHY IT WORKS: Minimalist gallery with clear visual hierarchy using whitespace effectively
✓ Spacing: Consistent 8pt grid (px-6 = 24px, mb-8 = 32px, space-y-4 = 16px)
✓ Typography: Font-light for elegance, clear size hierarchy (text-2xl → text-lg → text-sm → text-xs)
✓ Shadows: Subtle shadow-sm for cards creates depth without distraction
✓ Touch Targets: All buttons are 40-48px minimum (w-10 h-10 = 40px)
✓ Color: High-opacity text on white (opacity-60, opacity-40) maintains contrast
✓ Navigation: Bottom nav with clear icons + labels, active state (filled icon + color)
✗ AVOID: Overcrowded cards, missing touch targets, inconsistent spacing

EXAMPLE 2 - Artist Profile Screen:
` +
  screen2HTML.replace(/[{}]/g, '') +
  `
[Design Pattern Analysis]
✓ WHY IT WORKS: Clear profile hierarchy with stats, social proof, and content showcase
✓ Card Pattern: Rounded-3xl (24px) for primary card, rounded-2xl (20px) for secondary = visual hierarchy
✓ CTAs: Black button (primary) vs gray-50 button (secondary) = clear priority
✓ Stats Layout: Flexbox with space-x-6 creates scannable metrics row
✓ Tags: Pill-shaped with bg-gray-50 = subtle, non-intrusive categorization
✓ Grid: grid-cols-2 gap-3 = efficient content display for mobile
✗ AVOID: Equal visual weight for all buttons, cluttered profile sections

EXAMPLE 3 - Sleep Tracking Screen:
` +
  screen3HTML.replace(/[{}]/g, '') +
  `
[Design Pattern Analysis]
✓ WHY IT WORKS: Dark theme with atmospheric design for nighttime use
✓ Glassmorphism: backdrop-blur-sm + bg-opacity creates depth and modern feel
✓ Gradients (USED PURPOSEFULLY): from-indigo-500 to-purple-600 for primary CTA draws attention
✓ Visual Feedback: Pulse animation on sleep icon indicates interactivity
✓ Semantic Colors: Color-coded environment metrics (blue=temp, green=humidity, purple=noise)
✓ Dark Theme Colors: text-white, text-gray-300, text-gray-400 maintain contrast on dark backgrounds
✗ AVOID: Poor contrast on dark backgrounds, overusing gradients, missing focus states

EXAMPLE 4 - Meditation Session Screen:
` +
  screen4HTML.replace(/[{}]/g, '') +
  `
[Design Pattern Analysis]
✓ WHY IT WORKS: Immersive full-screen experience with breathing animation as focal point
✓ Button Hierarchy: Largest button (w-16 h-16) = primary action, smaller (w-12 h-12) = secondary
✓ Backdrop Effects: bg-white/30, bg-white/40, bg-white/60 = progressive emphasis through opacity
✓ Visual States: Breathing circles with animation create calming, purposeful interaction
✓ Information Card: Bottom card with session details doesn't compete with main content
✗ AVOID: Distracting animations, unclear button hierarchy, missing session context

PROFESSIONAL DESIGN SYSTEM PATTERNS:

SPACING SCALE (8pt Grid System):
- gap-1 / space-y-1: 4px (tight, related items)
- gap-2 / space-y-2: 8px (comfortable, list items)
- gap-3 / space-y-3: 12px (clear separation)
- gap-4 / space-y-4: 16px (standard section spacing)
- gap-6 / space-y-6: 24px (major sections)
- gap-8 / space-y-8: 32px (distinct content blocks)
- gap-12 / space-y-12: 48px (page-level separation)

SHADOW TOKENS (Surface Elevation):
- shadow-sm: Subtle lift (cards, buttons at rest)
- shadow-md: Medium elevation (dropdowns, popovers, hover states)
- shadow-lg: High elevation (modals, floating actions)
- COMBINE with transition-shadow duration-200 for smooth hover effects

BORDER RADIUS SCALE:
- rounded-lg: 8px (small cards, inputs, buttons)
- rounded-xl: 12px (medium cards, images)
- rounded-2xl: 16px (large cards, prominent containers)
- rounded-3xl: 24px (hero cards, featured content)
- rounded-full: 9999px (avatars, icon buttons, pills)

TYPOGRAPHY SCALE & USAGE:
- text-xs (11-12px): Labels, captions, metadata, timestamps
- text-sm (14px): Body text, descriptions, secondary content
- text-base (16px): Primary body text, comfortable reading
- text-lg (18px): Section subheadings, emphasized content
- text-xl (20px): Card titles, screen section headers
- text-2xl (24px): Page titles, primary headings
- text-3xl (30px): Hero headings, marketing content
- text-4xl (36px): Display text, splash screens

FONT WEIGHTS:
- font-light (300): Elegant, spacious designs (luxury, minimal apps)
- font-normal (400): Body text, readable content
- font-medium (500): Subtle emphasis, navigation labels
- font-semibold (600): Strong headings, primary CTAs
- font-bold (700): Maximum emphasis (use sparingly)

COLOR CONTRAST STANDARDS:
- Text on Light Backgrounds: text-gray-900 (primary), text-gray-600 (secondary), text-gray-400 (muted)
- Text on Dark Backgrounds: text-white (primary), text-gray-200 (secondary), text-gray-400 (muted)
- NEVER use pure #000 black - always use slate-900, gray-900, or similar
- Minimum Contrast: 4.5:1 for normal text, 3:1 for large text (18px+)

BUTTON STATES (MUST IMPLEMENT ALL):
Default: bg-blue-500 text-white rounded-lg px-6 py-3
Hover: hover:bg-blue-600 hover:scale-[1.02] hover:shadow-md
Active: active:scale-[0.98] active:bg-blue-700
Focus: focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
Disabled: disabled:opacity-50 disabled:cursor-not-allowed
Transition: transition-all duration-200 ease-out

CARD PATTERNS:
- Base: bg-white rounded-2xl shadow-sm p-4 (or p-6 for larger cards)
- Hover State: transition-shadow duration-200 hover:shadow-md hover:-translate-y-0.5
- Interactive Card: Add cursor-pointer and subtle scale on hover
- Nested Cards: Use shadow-sm for outer, border-gray-100 for inner to avoid shadow stacking

DECISION FRAMEWORKS:

When to use CARDS vs LISTS:
- Cards: Rich content with images, multiple data points, actions (e.g., product cards, articles)
- Lists: Scannable data, uniform items, high density (e.g., settings, contacts, transactions)

When to use GRADIENTS vs SOLIDS:
- Gradients: ONLY when explicitly requested, or for hero sections, empty states, decorative backgrounds
- Solids: DEFAULT choice for buttons, surfaces, professional apps (cleaner, more timeless)
- If using gradients: Use subtle 2-3 stop gradients, maintain contrast with text

When to use GLASSMORPHISM:
- Dark themes with layered content
- Overlays (modals, bottom sheets, notifications)
- Navigation bars over content
- Always combine: backdrop-blur-sm + bg-white/10 (or bg-black/20 on light)

IMAGERY POLICY (STRICT):
✓ All images MUST use Unsplash URLs only
✓ Format: https://images.unsplash.com/photo-[ID]?w=[WIDTH]&h=[HEIGHT]&fit=crop&auto=format&q=80
✓ Always include descriptive alt="..." text for accessibility
✓ Use appropriate dimensions (2x for retina: w=400 for 200px display width)
✗ NEVER use placeholder text, data URIs, other CDNs, or gradient-only image substitutes
✗ NEVER use generic placeholders - always use real Unsplash photos

ANTI-PATTERNS TO AVOID:
✗ Pure black (#000000) - use gray-900 or slate-900 instead
✗ Inconsistent spacing - always follow 4px/8px grid system
✗ Missing hover/focus states on interactive elements
✗ Poor contrast (below 4.5:1 for text)
✗ Touch targets smaller than 44x44px
✗ Mixing icon sets - use only Remix Icons
✗ Overcrowded interfaces - embrace whitespace
✗ Unclear visual hierarchy - use size, weight, color, spacing purposefully
✗ Gradients on everything - use sparingly and purposefully
✗ Overusing animations - keep them subtle and meaningful

Apply these patterns thoughtfully to create screens that feel professional, polished, and production-ready.
`;

// ==========================
// Screen Creation Prompt Templates
// ==========================

const screenPlanningTemplate =
  PromptTemplate.fromTemplate(`You are a Senior Product Designer and UX strategist. Analyze the user's request and determine:

  1. How many mobile screens are needed (1-8 screens)
  2. What each screen should contain
  3. The logical flow between screens

  For each screen, create a detailed prompt that will be used to generate that specific screen.

  Consider:
  - User journey and flow
  - Information architecture
  - Mobile UX best practices
  - Screen complexity and purpose

  Return a plan with the total number of screens and individual prompts for each screen.`);

const screenGenerationTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a Staff Product Designer from Apple/Stripe/Linear with 10+ years crafting award-winning mobile experiences. Your designs have won industry awards and are used by millions. Generate ONE production-ready mobile screen that matches or EXCEEDS the quality of industry leaders like Linear, Notion, Stripe, Airbnb, and Apple's native apps.

{colorPaletteInstructions}

` +
    demoScreensContext +
    `

OUTPUT FORMAT (STRICT):
- Single JSON object: {{ html, title, description }}
- No markdown, code fences, explanations, or comments
- HTML uses ONLY TailwindCSS utilities within a 300px mobile frame
- Every element must serve a clear purpose

PROFESSIONAL DESIGN SYSTEM SPECIFICATIONS:

1. SPACING SYSTEM (Optimized for 300px Mobile Width):
  
  CRITICAL: 300px is COMPACT. Use tighter spacing to maximize content and prevent overflow.
  
  Layout Spacing (compact for 300px):
  - Container padding: px-4 (16px - STANDARD for 300px width) | px-6 (24px - use sparingly)
  - Section spacing: mb-4 (16px standard) | mb-6 (24px for major sections) | mb-8 (32px rare)
  - Top padding: pt-8 or pt-10 (32-40px for status bar + breathing room)
  
  Component Spacing (tight for mobile):
  - Gap between items: gap-2 (8px - STANDARD) | gap-3 (12px comfortable) | gap-4 (16px spacious)
  - Vertical rhythm: space-y-2 (standard), space-y-3 (comfortable), space-y-4 (spacious)
  - Card padding: p-3 (12px compact) | p-4 (16px standard) | p-5 (20px spacious)
  
  Micro-spacing (tight for compact layouts):
  - Text-to-icon: space-x-1.5 (6px tight) | space-x-2 (8px standard)
  - Inline elements: gap-1.5 (6px) | gap-2 (8px)
  - List item spacing: space-y-2 (8px) | space-y-3 (12px)
  
  MOBILE SPACING RULES:
  ✓ DEFAULT container padding is px-4 (16px) NOT px-6
  ✓ DEFAULT section spacing is mb-4 (16px) or mb-6 (24px) NOT mb-8
  ✓ DEFAULT card padding is p-4 (16px) NOT p-6
  ✓ Use gap-2 and space-y-2 as standard (8px spacing)
  ✓ Save space with tight spacing while maintaining readability
  ✓ All spacing must be multiples of 4px (4, 8, 12, 16, 20, 24, 28, 32)

2. TYPOGRAPHY SYSTEM (Mobile-Optimized for 300px Width):
  
  CRITICAL: 300px is a COMPACT mobile width. Typography must be sized appropriately.
  
  Heading Hierarchy (sized for 300px screens):
  - Page Title: text-lg font-semibold text-gray-900 leading-tight (18px - fits well in 300px)
  - Section Heading: text-base font-semibold text-gray-900 leading-tight (16px)
  - Card Title: text-sm font-medium text-gray-900 leading-snug (14px)
  - Subsection: text-sm font-medium text-gray-900 (14px)
  
  Body Text (compact but readable):
  - Primary: text-sm font-normal text-gray-700 leading-relaxed (14px - standard body)
  - Secondary: text-xs font-normal text-gray-600 leading-relaxed (12px)
  - Caption: text-xs font-normal text-gray-500 leading-normal (12px)
  - Muted: text-[10px] font-normal text-gray-400 (10px - very small labels, counts)
  
  Special Cases:
  - Labels: text-[10px] font-medium text-gray-500 uppercase tracking-wide (10px)
  - Display/Hero (use rarely): text-xl font-bold text-gray-900 tracking-tight (20px max)
  - Stats/Numbers: text-lg font-semibold (18px - for prominent metrics)
  
  Elegant Design Option (for minimal/luxury apps):
  - Use font-light (300) with text-lg or text-xl for headings
  - Maintain readability by ensuring sufficient size even with light weight
  
  MOBILE TYPOGRAPHY RULES:
  ✓ DEFAULT body text should be text-sm (14px) NOT text-base
  ✓ Headings should be text-lg (18px) or text-base (16px) NOT text-2xl
  ✓ Keep line-height tight (leading-tight, leading-snug) to save vertical space
  ✓ Use text-xs (12px) liberally for secondary info, labels, captions
  ✓ Only use text-xl (20px) or larger for hero/display elements (rare)
  ✓ Ensure 4.5:1 contrast minimum for normal text, 3:1 for large text (18px+)

3. COLOR & SURFACE DESIGN:
  Light Theme (DEFAULT):
  - Background: bg-white (main) | bg-gray-50 (alternate sections) | bg-gray-100 (sunken areas)
  - Surface: bg-white with shadow-sm/md/lg for elevation
  - Text: text-gray-900 (primary) | text-gray-600 (secondary) | text-gray-400 (muted)
  - Borders: border-gray-200 (standard) | border-gray-100 (subtle)
  - NEVER use pure black (#000) - always gray-900 or slate-900
  
  Dark Theme (when requested):
  - Background: bg-slate-950 | bg-slate-900 | bg-slate-800
  - Surface: bg-slate-900 with border-white/10 for subtle elevation
  - Text: text-white (primary) | text-gray-200 (secondary) | text-gray-400 (muted)
  - Glassmorphism: backdrop-blur-sm bg-white/10 for overlays
  
  Semantic Colors:
  - Success: bg-green-50 text-green-700 border-green-200 (subtle) | bg-green-500 text-white (bold)
  - Error: bg-red-50 text-red-700 border-red-200 (subtle) | bg-red-500 text-white (bold)
  - Warning: bg-amber-50 text-amber-700 border-amber-200 (subtle) | bg-amber-500 text-white (bold)
  - Info: bg-blue-50 text-blue-700 border-blue-200 (subtle) | bg-blue-500 text-white (bold)
  
  Gradient Usage (USE SPARINGLY):
  - DEFAULT: Use solid colors for professional, timeless designs
  - ONLY use gradients if USER explicitly requests them OR for:
    * Hero sections / featured content
    * Empty state illustrations / decorative elements
    * Dark theme accents (subtle gradients work better on dark)
  - When using: 2-3 color stops maximum, maintain text contrast
  - Example: from-blue-500 via-blue-600 to-indigo-600 (subtle, purposeful)

4. SHADOW & ELEVATION SYSTEM:
  Surface Levels:
  - Level 0 (flat): No shadow, border-gray-100 for definition
  - Level 1 (resting): shadow-sm (subtle lift for cards, buttons)
  - Level 2 (raised): shadow-md (dropdowns, popovers, hover states)
  - Level 3 (floating): shadow-lg (modals, dialogs, floating actions)
  - Level 4 (overlay): shadow-xl (maximum elevation, use rarely)
  
  Hover Effects:
  - Cards: transition-shadow duration-200 hover:shadow-md
  - Buttons: hover:shadow-md combined with subtle scale
  - Lists: hover:bg-gray-50 (no shadow needed)
  
  RULE: Use shadows to communicate hierarchy, not decoration

5. BORDER RADIUS SYSTEM:
  Component Sizes:
  - Small (inputs, small buttons, tags): rounded-lg (8px)
  - Medium (standard cards, buttons, images): rounded-xl (12px)
  - Large (prominent cards, hero sections): rounded-2xl (16px)
  - Extra Large (featured content, hero cards): rounded-3xl (24px)
  - Circular (avatars, icon buttons, pills): rounded-full
  
  Consistency Rules:
  - Related components use same radius (all buttons in a group)
  - Larger elements can use larger radius for visual balance
  - Maintain radius when nesting (inner element slightly smaller radius)

6. COMPONENT EXCELLENCE:
  
  Buttons (MUST INCLUDE ALL STATES - Mobile Optimized):
  Primary Button Template (300px optimized):
    <button class="bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm
                   hover:bg-blue-600 hover:scale-[1.02] hover:shadow-md
                   active:scale-[0.98] active:bg-blue-700
                   focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 ease-out">
      Action
    </button>
    (py-2.5 = 10px + text-sm line-height ~20px + 10px = ~40px total, add min-h-[44px] if needed)
  
  Secondary Button (compact):
    bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200
  
  Destructive Button (compact):
    bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-red-600
  
  Text Button (minimal):
    text-blue-500 hover:text-blue-600 hover:underline text-sm font-medium
  
  Icon Button (circular, compact):
    <button class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
      <i class="ri-heart-line text-lg"></i>
    </button>
  
  MOBILE BUTTON RULES:
  ✓ Use px-5 py-2.5 for standard buttons (more compact than px-6 py-3)
  ✓ Use text-sm font-medium for button text (14px - readable but compact)
  ✓ Ensure minimum touch target 44x44px (use min-h-[44px] if py-2.5 isn't enough)
  ✓ Icon buttons should be w-10 h-10 (40px) or w-11 h-11 (44px) minimum
  
  Cards (Mobile-Optimized for 300px):
  Standard Card (compact padding):
    <div class="bg-white rounded-2xl shadow-sm p-4
                transition-shadow duration-200 hover:shadow-md hover:-translate-y-0.5">
      <!-- content -->
    </div>
    (p-4 = 16px padding is standard for 300px width)
  
  Interactive Card (clickable):
    Add: cursor-pointer and onclick/link wrapper
  
  Compact Card (tight spacing):
    <div class="bg-white rounded-xl shadow-sm p-3">
      <!-- content -->
    </div>
  
  List-Style Card (very compact):
    <div class="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3">
      <!-- icon, content, arrow -->
    </div>
  
  MOBILE CARD RULES:
  ✓ DEFAULT card padding is p-4 (16px) NOT p-6
  ✓ Use p-3 (12px) for compact cards or list items
  ✓ Use rounded-xl or rounded-2xl (12-16px radius) for cards
  ✓ Keep shadow-sm for resting state (subtle depth)
  
  Input Fields (Mobile-Optimized):
  Standard Input (compact):
    <input class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm
                  bg-white text-gray-900 placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200
                  disabled:bg-gray-50 disabled:text-gray-500"
           placeholder="Enter text..." />
  
  With Label (top aligned - saves space):
    <label class="text-xs font-medium text-gray-700 mb-1.5 block">Label</label>
  
  MOBILE INPUT RULES:
  ✓ Use px-3 py-2.5 for inputs (more compact than px-4 py-3)
  ✓ Use text-sm for input text (14px - readable)
  ✓ Labels should be text-xs (12px) to save space
  ✓ Ensure minimum 44px height for touch targets
  
  Lists (Compact for 300px):
  List Item (compact spacing):
    <div class="flex items-center gap-2.5 p-3 rounded-lg
                transition-colors duration-150 hover:bg-gray-50 cursor-pointer">
      <!-- icon, content, action -->
    </div>
  
  Very Compact List (tight):
    <div class="flex items-center gap-2 py-2.5 px-3
                transition-colors duration-150 hover:bg-gray-50 cursor-pointer">
      <!-- minimal spacing for dense lists -->
    </div>
  
  MOBILE LIST RULES:
  ✓ Use p-3 or py-2.5 px-3 for list items (compact)
  ✓ Use gap-2 or gap-2.5 for spacing between elements
  ✓ Ensure minimum 44px height for tappable items
  ✓ Use text-sm for list item text

7. INTERACTION STATES & MICRO-INTERACTIONS:
  
  Timing:
  - Instant feedback: 150ms (color changes, simple transitions)
  - Standard: 200ms (scale, shadow, most interactions)
  - Complex: 300ms (layout shifts, complex animations)
  - Easing: ease-out (default), ease-in-out (reversible animations)
  
  Scale Transforms:
  - Hover (lift): hover:scale-[1.02] (subtle growth)
  - Active (press): active:scale-[0.98] (tactile feedback)
  - Combine with other effects: hover:scale-[1.02] hover:shadow-md
  
  Translation:
  - Card hover: hover:-translate-y-0.5 (subtle lift with shadow)
  - Slide-in: animate-slide-in for entry animations (use sparingly)
  
  Focus States (CRITICAL for accessibility):
  - Always include: focus-visible:ring-2 focus-visible:ring-[color]-500
  - Add offset for clarity: focus-visible:ring-offset-2
  - Ensure ring color contrasts with background
  
  RULE: Every interactive element MUST have hover, active, and focus states

8. MOBILE-FIRST PATTERNS:
  
  Touch Targets:
  - Minimum: 44x44px for all interactive elements
  - Comfortable: 48x48px for primary actions
  - Icon buttons: w-10 h-10 (40px) minimum, w-12 h-12 (48px) preferred
  - List items: Full-width tappable, min-h-[44px]
  
  Navigation Patterns:
  Bottom Navigation (standard mobile pattern):
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 safe-area-inset-bottom">
      <div class="flex items-center justify-around max-w-md mx-auto">
        <!-- 3-5 nav items, icon + label, active state -->
      </div>
    </nav>
  
  Top Navigation:
    <header class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
      <!-- logo/title, actions -->
    </header>
  
  Scrollable Content:
    <div class="overflow-y-auto max-h-[calc(100vh-XXXpx)]">
      <!-- Use when content exceeds viewport, calculate height accounting for fixed headers/footers -->
    </div>
  
  Thumb-Friendly Zones:
  - Place primary actions in bottom third of screen
  - Important content in middle third
  - Secondary/contextual actions in top third

9. CONTENT STRATEGY & STATES:
  
  Empty States (compact for 300px):
    <div class="flex flex-col items-center justify-center py-8 px-4 text-center">
      <i class="ri-inbox-line text-4xl text-gray-300 mb-3"></i>
      <h3 class="text-base font-medium text-gray-900 mb-1.5">No items yet</h3>
      <p class="text-xs text-gray-500 mb-4">Get started by creating your first item</p>
      <button class="bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium">Create Item</button>
    </div>
  
  Loading States:
  - Skeleton screens (preferred over spinners)
  - Show content structure while loading
  - Use: bg-gray-200 animate-pulse rounded-lg h-4 w-full
  
  Error States (compact for 300px):
    <div class="bg-red-50 border border-red-200 rounded-lg p-3">
      <div class="flex gap-2.5">
        <i class="ri-error-warning-line text-red-500 text-lg flex-shrink-0"></i>
        <div>
          <h4 class="text-xs font-medium text-red-900 mb-1">Error title</h4>
          <p class="text-xs text-red-700 mb-2">Clear explanation of what went wrong</p>
          <button class="text-xs font-medium text-red-600 hover:text-red-700">Retry</button>
        </div>
      </div>
    </div>
  
  Success Feedback:
  - Toast/banner at top or bottom
  - Green check icon + confirmation message
  - Auto-dismiss after 3-5 seconds or manual dismiss

10. ACCESSIBILITY (BUILT-IN, NOT OPTIONAL):
  
  - Semantic HTML: Use <button>, <nav>, <header>, <main>, <article> appropriately
  - ARIA labels: Add aria-label="description" to icon-only buttons
  - Focus management: Ensure logical tab order, visible focus states
  - Color contrast: 4.5:1 minimum for text, 3:1 for UI components
  - Touch targets: 44x44px minimum for all interactive elements
  - Alt text: Descriptive alt attributes on all images
  - Heading hierarchy: Proper h1 → h2 → h3 structure

TECHNICAL CONSTRAINTS (STRICT):
- Width: EXACTLY 300px - this is a COMPACT mobile width (use w-full, never w-[300px])
- Height: min-h-[600px] minimum, flexible beyond (can go up to ~1000px)
- Positioning: relative as base, absolute only within relative containers
- Icons: ONLY Remix Icon CSS classes (e.g., <i class="ri-home-line text-lg"></i>)
  * Default icon size: text-lg (18px) or text-xl (20px)
  * Small icons: text-base (16px)
  * Large icons: text-2xl (24px) - use sparingly
- DO NOT include <link> or <script> tags - Remix Icons already injected by host
- No external dependencies beyond Remix Icons
- Pure TailwindCSS utilities only (no custom CSS or inline styles)
- Valid semantic HTML5 with proper structure
- Theme: Light theme DEFAULT unless user explicitly requests dark theme
- Gradients: Solid colors DEFAULT unless user explicitly requests gradients

300px WIDTH OPTIMIZATION RULES:
✓ Content must fit comfortably within 300px width
✓ Account for padding (px-4 = 16px on each side = 268px content width)
✓ Use compact spacing (px-4, gap-2, space-y-2, mb-4 as defaults)
✓ Use mobile-appropriate font sizes (text-sm for body, text-lg for headings)
✓ Keep touch targets at 44x44px minimum even with tight spacing
✓ Avoid wide elements that cause horizontal overflow
✓ Test that all content is readable and accessible at 300px width

PROFESSIONAL VALIDATION CHECKLIST (verify before output):

SPACING & LAYOUT:
✓ All spacing follows 4px/8px grid (gap-2, gap-3, gap-4, p-4, p-6, mb-8, etc.)
✓ Container padding is px-4, px-6, or px-8 (never odd values)
✓ Consistent vertical rhythm using space-y-* or gap-*
✓ Content doesn't feel cramped or excessively spacious

TYPOGRAPHY:
✓ Clear hierarchy: titles → headings → body → captions
✓ Readable font sizes: minimum text-xs (12px) for body content
✓ Appropriate font weights: light/normal for body, medium/semibold for headings
✓ Text contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text (18px+)
✓ No pure black (#000) - using gray-900, slate-900, or similar

COLORS:
✓ Using color palette if provided, or default professional colors
✓ Semantic colors for states (green=success, red=error, amber=warning)
✓ Solid colors by default (no gradients unless explicitly requested)
✓ Sufficient contrast between backgrounds, surfaces, and text

COMPONENTS:
✓ All buttons have 5 states: default, hover, active, focus, disabled
✓ Button interactions: hover:scale-[1.02], active:scale-[0.98], transition-all duration-200
✓ Cards have subtle shadows (shadow-sm) and hover effects if interactive
✓ Input fields have focus states with ring-2 and proper borders
✓ All interactive elements ≥ 44x44px touch target

INTERACTIONS:
✓ Smooth transitions on all state changes (duration-150/200/300)
✓ Hover states on all interactive elements (buttons, cards, links, list items)
✓ Active states provide tactile feedback (scale-[0.98])
✓ Focus-visible states with ring-2 for keyboard navigation
✓ Animations are subtle and purposeful (not distracting)

MOBILE PATTERNS:
✓ Touch targets meet 44x44px minimum
✓ Navigation is thumb-friendly (bottom nav preferred)
✓ Scrollable areas have overflow-y-auto and max height
✓ Content is scannable and not overwhelming

VISUAL POLISH:
✓ Shadows create subtle depth (shadow-sm for resting, shadow-md for hover)
✓ Border radius is consistent and appropriate to component size
✓ Icons are consistent (all Remix Icons, proper sizing text-lg/xl/2xl)
✓ Whitespace is used purposefully to create breathing room
✓ Visual hierarchy guides eye naturally from primary → secondary → tertiary

ACCESSIBILITY:
✓ Semantic HTML with proper heading hierarchy (h1 → h2 → h3)
✓ ARIA labels on icon-only buttons
✓ All images have descriptive alt text
✓ Focus states are clearly visible
✓ Color is not the only means of conveying information

IMAGES:
✓ Using Unsplash URLs only: https://images.unsplash.com/photo-[ID]?w=[WIDTH]&h=[HEIGHT]&fit=crop&auto=format&q=80
✓ Every image has descriptive alt="..." text
✓ No placeholders, data URIs, or other image sources

PROFESSIONAL FEEL:
✓ Looks like it belongs in a $1B+ app (Apple, Stripe, Linear quality)
✓ Users would trust this with sensitive data
✓ Information hierarchy is immediately clear
✓ Actions are obvious and intuitive
✓ Every element serves a clear purpose
✓ Design feels cohesive and thoughtfully crafted

Generate ONE professional, production-ready mobile screen that users would love to interact with daily.`,
);

export class ScreenCreator {
  private openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
    private aiUsageService: AiUsageService,
  ) {}

  async planScreens(
    message: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    userId: string,
    designId: string,
  ): Promise<ScreenPlan> {
    const planningPrompt = await screenPlanningTemplate.format({});

    const allMessages = [
      { role: 'system' as const, content: planningPrompt },
      ...contextMessages,
      { role: 'user' as const, content: message },
    ];

    const response = await this.openrouter.chat.send({
      model: coreConstant.AI_MODELS.DESIGN.NAME,
      messages: allMessages,
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'screenPlan',
          strict: true,
          schema: screenPlanJsonSchema,
        },
      },
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const screenPlan = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as ScreenPlan;

    // Fix inconsistency: ensure totalScreens matches screenPrompts.length
    if (screenPlan.totalScreens !== screenPlan.screenPrompts.length) {
      console.warn(
        `[ScreenCreator] Inconsistent screen plan: totalScreens=${screenPlan.totalScreens}, screenPrompts.length=${screenPlan.screenPrompts.length}. Fixing...`,
      );
      screenPlan.totalScreens = screenPlan.screenPrompts.length;
    }

    // Extract token usage from completion
    const usage = response.usage as any || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    const tokenUsage = {
      inputTokens: usage.promptTokens || usage.prompt_tokens || 0,
      outputTokens: usage.completionTokens || usage.completion_tokens || 0,
      totalTokens: usage.totalTokens || usage.total_tokens || 0,
    };

    console.log('[ScreenCreator] Deducting credits for planning:', tokenUsage);

    // Cost logging
    await this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_planning',
      designId,
    } as any);

    // Deduct credits immediately after planning
    await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_planning',
      tokenUsage,
    );

    return screenPlan;
  }

  async generateScreen(
    screenPrompt: ScreenPromptData,
    message: string,
    contextMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    colorPalette: ColorPalette | null | undefined,
    userId: string,
    designId: string,
  ): Promise<SingleScreen> {
    const colorPaletteInstructions =
      generateColorPaletteInstructions(colorPalette);
    const generationPrompt = await screenGenerationTemplate.format({
      colorPaletteInstructions,
    });

    const userContent = `Original request: ${message}\n\nSpecific screen prompt: ${screenPrompt.prompt}`;
    const allMessages = [
      { role: 'system' as const, content: generationPrompt },
      ...contextMessages,
      { role: 'user' as const, content: userContent },
    ];

    const response = await this.openrouter.chat.send({
      model: coreConstant.AI_MODELS.DESIGN.NAME,
      messages: allMessages,
      responseFormat: {
        type: 'json_schema',
        jsonSchema: {
          name: 'screen',
          strict: true,
          schema: singleScreenJsonSchema,
        },
      },
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    const screen = (typeof content === 'object' ? content : JSON.parse(content ?? '{}')) as SingleScreen;

    // Extract token usage from completion
    const usage = response.usage as any || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    const tokenUsage = {
      inputTokens: usage.promptTokens || usage.prompt_tokens || 0,
      outputTokens: usage.completionTokens || usage.completion_tokens || 0,
      totalTokens: usage.totalTokens || usage.total_tokens || 0,
    };

    console.log(
      '[ScreenCreator] Deducting credits for screen generation:',
      tokenUsage,
    );

    // Cost logging
    await this.aiUsageService.logUsage({
      userId,
      modelName: coreConstant.AI_MODELS.DESIGN.NAME,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      type: 'screen_creation',
      designId,
    } as any);

    // Deduct credits immediately after generation
    await this.creditManager.deductCredits(
      userId,
      designId,
      'screen_creation',
      tokenUsage,
    );

    return screen;
  }

  async saveScreen(
    screen: SingleScreen,
    designId: string,
  ): Promise<ExistingScreen> {
    return await this.prisma.screen.create({
      data: {
        designId,
        title: screen.title,
        description: screen.description,
        html: screen.html,
      },
    });
  }

  async saveAssistantMessage(designId: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: {
        designId,
        content,
        role: 'assistant',
      },
    });
  }
}

export default ScreenCreator;
