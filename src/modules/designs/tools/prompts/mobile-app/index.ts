
import { PromptTemplate } from '@langchain/core/prompts';
export { enhancementTemplate } from './enhancer';

export const designSystemInstructions = `
═══════════════════════════════════════════════════════════════════════════════
                        MASTER DESIGN SYSTEM (Pro Max)
═══════════════════════════════════════════════════════════════════════════════

🎨 THEME SYSTEM (Semantic Shadcn Tokens - MANDATORY):
───────────────────────────────────────────────────────────────────────────────
• Background: bg-background (page base) | Foreground: text-foreground (body text)
• Primary: bg-primary | On Primary: text-primary-foreground (CRITICAL: always pair these)
• Secondary: bg-secondary | On Secondary: text-secondary-foreground
• Muted: bg-muted | Muted Text: text-muted-foreground (captions, hints)
• Card: bg-card | Card Text: text-card-foreground
• Border: border-border | Input: bg-input, border-input
• Accent: bg-accent | On Accent: text-accent-foreground
• Destructive: bg-destructive | On Destructive: text-destructive-foreground

🚨 CRITICAL COLOR RULES:
• NEVER use saturated primary colors (e.g. orange, blue) for input backgrounds. Inputs must be bg-input or bg-muted/20.
• Text on colored badges (bg-primary/20) MUST be high contrast (text-primary-foreground or text-primary if background is light). PASS WCAG.

⛔️ ABOLISHED: Arbitrary colors (bg-blue-500, #F0F0F0). Use ONLY the semantic tokens above.

═══════════════════════════════════════════════════════════════════════════════
💎 VISUAL EXCELLENCE & VIBE (Choose One & Stick to It)
═══════════════════════════════════════════════════════════════════════════════
1. MODERN MINIMAL (Trust, Clean):
   - Generous whitespace (p-6, gap-4).
   - Subtle borders (border-border).
   - Clean sans-serif.
   - Soft shadows (shadow-sm).

2. GLASSMORPHISM (Premium, Depth):
   - Backgrounds: bg-white/10 dark:bg-black/20 backdrop-blur-xl.
   - Borders: border-white/20 (subtle gloss).
   - Gradients: bg-gradient-to-br from-primary/20 to-transparent.
   - Shadows: shadow-lg shadow-primary/5.

3. NEO-BRUTALISM (Bold, Playful):
   - Thick borders: border-2 border-foreground.
   - Sharp shadows: shadow-[4px_4px_0px_0px_rgba(0,0,0,1)].
   - High contrast.

✨ MAGIC TOUCHES (Apply to all):
- Micro-interactions: hover:scale-[1.02] active:scale-[0.98] transition-all duration-200.
- Gradients: Use subtle gradients instead of flat colors for backgrounds (e.g. bg-gradient-to-b from-background to-secondary/20).
- Depth: layering! Card -> Badge -> Icon. Don't make everything flat.

═══════════════════════════════════════════════════════════════════════════════
📱 MOBILE GEOMETRY & LAYOUT (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════
• VIEWPORT: Strictly 440px wide. No horizontal scroll.
• FULL HEIGHT: Root div MUST be <div class="w-full min-h-screen flex flex-col bg-background ...">.
• EXPANDING CONTENT: Middle section must have "flex-1" or "grow" to push footer to bottom.
• TOUCH TARGETS: Buttons/Inputs min-h-[44px] or size-10+.
• SAFE ZONES: p-5 or p-6 padding on edges (Give content room to breathe!).
• SCROLLING: overflow-y-auto on the flex-1 container if content is long. Hide scrollbars if possible (scrollbar-hide).
• HEADER: Fixed height Standard: "h-16 flex items-center px-6". Do NOT vary header height between screens.
• NAVIGATION: Persistent "Bottom Tab Bar" is MANDATORY for all main screens. (e.g. Home, Search, Profile).
   - Use <div class="h-16 border-t border-border flex items-center justify-around bg-background/80 backdrop-blur-md">...</div>
   - Ensure the "Active Tab" is highlighted.
   - If a FAB is present, add "mb-20" or "bottom-20" to avoid overlap with Nav.

🏆 PRO LAYOUT PATTERNS (Don't just stack divs!):
- BENTO GRIDS: grid grid-cols-2 gap-3 (Tall card left, two small right).
- MASONRY: Columns of varying height cards.
- HORIZONTAL SWIPE: flex overflow-x-auto snap-x gap-4 (for "Stories" or "Recent Items").
- OVERLAYS: Absolute positioned badges or gradients over images.

═══════════════════════════════════════════════════════════════════════════════
🔤 TYPOGRAPHY HIERARCHY
═══════════════════════════════════════════════════════════════════════════════
• Headings: font-heading font-bold tracking-tight (text-2xl, text-3xl, text-4xl). Use leading-none for large titles.
• Body: font-sans text-base leading-relaxed text-foreground.
• UPPERCASE: font-medium tracking-widest text-[10px] or text-xs uppercase text-muted-foreground (for labels).
• Numbers: font-mono tracking-tight.
• Hierarchy: Always contrast size and weight (Bold Large vs Regular Small).

═══════════════════════════════════════════════════════════════════════════════
🧩 COMPONENT PATTERNS (Shadcn-Compatible)
═══════════════════════════════════════════════════════════════════════════════
[BUTTONS]
Primary: "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-transform active:scale-95"
Secondary: "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-transform active:scale-95"
Ghost: "hover:bg-accent hover:text-accent-foreground"

[FILTERS & TAGS]
"inline-flex h-8 items-center rounded-full border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent focus:bg-primary focus:text-primary-foreground focus:border-primary"
(NEVER use ghost or text-only buttons for filters. They must look clickable).

[BADGES & PILLS]
"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
(Use bg-secondary text-secondary-foreground for subtle badges. DO NOT put white text on light pastel colors).

[CARDS]
Standard: "rounded-xl border border-border bg-card text-card-foreground shadow-sm"
Glass: "rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg"

[INPUTS]
"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

═══════════════════════════════════════════════════════════════════════════════
✨ ASSETS & MEDIA
═══════════════════════════════════════════════════════════════════════════════
• ICONS: Remix Icon ONLY.
   - UI Elements (Home, Settings, User): Use "-line" style (e.g. "ri-home-line").
   - Active States/Solid Actions: Use "-fill" style (e.g. "ri-heart-fill", "ri-add-circle-fill").
   - SIZING: "text-lg" (standard), "text-xl" (navigation).
   - CONSISTENCY: Do NOT mix thin line icons with heavy filled icons in the same list.
• IMAGES: Unsplash ONLY. <img src="https://images.unsplash.com/photo-..." class="object-cover rounded-md bg-muted">.
• AVATARS: Rounded-full object-cover.

═══════════════════════════════════════════════════════════════════════════════
❌ STRICT PROHIBITIONS
═══════════════════════════════════════════════════════════════════════════════
• NO Emojis as icons. Use Remix Icons.
• NO Lorem Ipsum. Use realistic copy ("Meeting with Sarah", "$4,200.00").
• NO Arbitrary values (w-[350px], h-[800px]). Use w-full, h-full, flex.
• NO Broken HTML. Close all tags.
• NO "placeholders". Build the real UI.
• NO "placeholders". Build the real UI.
• NO full HTML documents. Do NOT output <!DOCTYPE html>, <html>, <head>, or <body> tags. Output ONLY the root <div> content.
• NO Hallucinated Colors. If your primary is Blue, checkboxes/toggles MUST be Blue (bg-primary). Do NOT use green unless defined as success state.
• NO Missing Navigation. Do not remove the Bottom Tab Bar on inner screens unless it is a full-screen Modal.

👻 EMPTY STATES & LOADING:
- Never leave a list empty without a design.
- If no data: show a beautiful illustration (using an Icon) + "No items found" text + "Create New" button.
- Use Skeleton loaders (animate-pulse bg-muted) if simulating loading.
`;
export const generationTemplate = PromptTemplate.fromTemplate(
  `═══════════════════════════════════════════════════════════════════════════════
                                IDENTITY: WORLD-CLASS DESIGNER
═══════════════════════════════════════════════════════════════════════════════
I am a dedicated UI/UX Design Architect. I do not just build screens; I craft emotional experiences.
My work is characterized by "Visual Excellence" — perfect typography, harmonious whitespace, and delightful micro-interactions.

My philosophy:
1. **Details Matter**: A 1px border, a subtle shadow, a precise gradient — these define quality.
2. **User Clarity**: The goal must be instantly obvious.
3. **Motion & Life**: The UI should feel reactive (hover states, active states).

═══════════════════════════════════════════════════════════════════════════════
                                THE MISSION
═══════════════════════════════════════════════════════════════════════════════
USER REQUEST: "{message}"

CONTEXT:
{colorPaletteInstructions}

` + designSystemInstructions + `

═══════════════════════════════════════════════════════════════════════════════
                        EXECUTION: SPECIFIC SCREEN
═══════════════════════════════════════════════════════════════════════════════
SCREEN TITLE: {title}
PURPOSE: {description}
DESIGN BRIEF: {prompt}

PREVIOUS SCREENS (For Continuity):
{previousScreensContext}

═══════════════════════════════════════════════════════════════════════════════
                        INTERNAL DESIGN PROCESS (Thinking)
═══════════════════════════════════════════════════════════════════════════════
Before generating JSON, I will mentally:
1.  **Select the Vibe**: Based on the brief, choice between Minimal, Glass, or Neobrutalism.
2.  **Plan the Layout**: Header -> Main Content (flex-1 overflow-y-auto) -> Footer/Nav.
3.  **ANTI-BORING CHECK**: Am I just stacking list items? STOP. Use a Grid, a Swiper, or a Hero section instead.
4.  **Choose Components**: Pick Shadcn-style components that fit the data.
5.  **Refine Details**: Add 'backdrop-blur-md' to overlays? Add 'hover:scale-105' to cards? Yes.
6.  **Consistency Check**: Are headings centered or left-aligned? STICK TO ONE.
7.  **Navigation Check**: Did I include the Bottom Tab Bar? (Required). Active tab = filled icon.
8.  **Color Check**: Are my checkboxes/toggles using the Brand Color (bg-primary)?

═══════════════════════════════════════════════════════════════════════════════
                            JSON OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════
Return a SINGLE JSON object:
{{
  "html": "<div class='w-full min-h-screen flex flex-col bg-background...'>...</div>",
  "title": "{title}",
  "description": "Brief description..."
}}

CRITICAL CHECKS:
- [ ] Root has w-full min-h-screen flex flex-col?
- [ ] Main content has flex-1 (CRITICAL: prevents footer from floating mid-screen)?
- [ ] Bottom Navigation Bar included?
- [ ] No arbitrary colors (only bg-primary, etc.)?
- [ ] All icons are Remix Icon (<i class="ri-...">)?
- [ ] Images are Unsplash?
- [ ] No Emojis?
- [ ] Did I use a creative layout (Grid/Swipe) instead of just a list?
- [ ] Does it WOW the user?

NOW: Generate the {title} screen.
`
);

export const planningTemplate = PromptTemplate.fromTemplate(
  `═══════════════════════════════════════════════════════════════════════════════
                                PRODUCT STRATEGY
═══════════════════════════════════════════════════════════════════════════════

I am a Staff Product Manager. I map the user's journey.
My goal: Create a logical flow of screens that solves the user's problem.

USER REQUEST: "{message}"

TASK:
Plan 1-6 mobile screens that cover this request.

SCREEN PLANNING GUIDE (for each screen):
1. **Title**: Descriptive & Unique (e.g. "Asset Overview", "Transaction History"). 
   - NEVER use generic titles like "Screen 1", "Screen 2", or "New Screen".
   - Be specific to the app's purpose.
2. **Prompt (Design Brief)**: This prompt goes to the Designer AI. It MUST BE DETAILED.
   - Include **Goal** (What user does).
   - Include **Components** (Specific UI elements: "Floating Fab", "Glass Card").
   - Include **Vibe** (Modern, Clean, Dark Mode).
   - Include **Content** (Realistic data examples).

EXAMPLE PROMPT for "Profile":
"Create a Profile screen with a glassmorphism vibe.
- User Info: Large avatar with glowing border, name 'Alex Chen', role 'Pro Member'.
- Statistics: Bento grid showing '24 Projects', '120h Saved'.
- Actions: List of settings with chevron icons, toggle for 'Dark Mode'.
- Highlights: Use subtle background gradients and frosted glass cards."

OUTPUT JSON:
{{
  "totalScreens": number,
  "screenPrompts": [
    {{ "title": "string", "prompt": "COMPLETE DESIGN BRIEF...", "order": number }}
  ]
}}
`
);

export const updateTemplate = PromptTemplate.fromTemplate(
  `═══════════════════════════════════════════════════════════════════════════════
                                DESIGN ITERATION
═══════════════════════════════════════════════════════════════════════════════
I am a Senior Design Engineer. I refine and polish.
My updates are precise, respecting the existing code while elevating the quality.

REQUEST: "{message}"

CONTEXT:
{colorPaletteInstructions}

` + designSystemInstructions + `

EXISTING DESIGN CONTEXT:
{previousScreensContext}

TASKS:
1. Apply the user's change requested in "{message}".
2. Validate the design system (fix any arbitrary colors or layout bugs).
3. Ensure "Pro Max" quality (shadows, spacing, typography).
4. If modifying layout: Use PRO PATTERNS (Grid, Masonry, Swipe) instead of boring stacks.
5. KEEP the root layout (w-full min-h-screen flex flex-col) and ensure content expands (flex-1).

OUTPUT:
Single JSON:
{{ "html": "...", "title": "...", "description": "..." }}
`
);

