import { PromptTemplate } from '@langchain/core/prompts';

// ---------------------------------------------------------------------------
// 1. CORE QUALITY PRINCIPLES
// ---------------------------------------------------------------------------
const QUALITY_GUIDELINES = `
CORE QUALITY CHECKLIST (Non-Negotiable):
1.  **Touch Targets**: Buttons/Inputs must be min-h-[44px] (h-10, h-11, h-12, h-14).
2.  **Typography Hierarchy**: 
    - Hero/Balance: 'text-4xl/text-5xl font-bold font-heading tracking-tighter'
    - Section Titles: 'text-xl font-bold font-heading'
    - Labels: 'text-xs font-bold uppercase tracking-widest text-muted-foreground'
    - Body: 'text-sm text-muted-foreground'
3.  **Real Data**: Names, prices ($84.20), times (04:30 PM), percentages (+8.2%). NO placeholders.
4.  **Shadows Everywhere**:
    - Cards: 'shadow-lg' or 'shadow-2xl'
    - Colored glows: 'shadow-[0_0_15px_rgba(COLOR,0.3)]'
    - Buttons: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]'
5.  **Gradients**:
    - Text: 'bg-gradient-to-r from-primary via-accent to-blue-500 bg-clip-text text-transparent'
    - Borders: '<div class="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-X blur opacity-40"></div>'
    - Buttons: 'bg-gradient-to-tr from-primary to-accent'
6.  **Interactions**: 'active:scale-95 transition-transform', 'hover:text-foreground transition-colors'
7.  **Layout**: No fixed widths. Use 'w-full', 'flex-1', 'size-X', or grid-cols.
`;

// ---------------------------------------------------------------------------
// 2. LAYOUT SHELL (Competitor-inspired)
// ---------------------------------------------------------------------------
const LAYOUT_SHELL_INSTRUCTION = `
MANDATORY ROOT CONTAINER (DO NOT wrap in html/body):

<!-- Fonts & Styles -->
<!-- Fonts & Styles -->
{fontInstructions}

<div class="flex flex-col min-h-screen w-full bg-background text-foreground font-sans overflow-x-hidden relative">

  <!-- 1. HEADER: pt-12 accounts for status bar -->
  <header class="flex items-center justify-between px-6 pt-12 pb-4 z-10">
    <div class="flex flex-col">
      <h1 class="text-2xl font-bold font-heading tracking-tight bg-gradient-to-r from-primary via-accent to-blue-500 bg-clip-text text-transparent">
        AppName
      </h1>
      <p class="text-xs text-muted-foreground font-medium">Good evening, User</p>
    </div>
    <!-- Profile with gradient ring -->
    <div class="relative">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full opacity-75 blur-[2px]"></div>
      <img alt="Profile" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop" 
           class="relative size-10 rounded-full object-cover border-2 border-background" />
      <div class="absolute top-0 right-0 size-3 bg-green-500 border-2 border-background rounded-full z-10"></div>
    </div>
  </header>

  <!-- 2. MAIN: flex-1 fills space, overflow-y-auto for scrolling, pb-32 for nav clearance -->
  <main class="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
    <!-- YOUR CONTENT GOES HERE -->
  </main>

  <!-- 3. FLOATING ACTION BUTTON (optional) -->
  <button class="fixed bottom-24 right-6 size-14 rounded-full bg-gradient-to-tr from-primary to-accent shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center z-50 active:scale-95 transition-transform">
    <span class="material-icons text-2xl text-white">add</span>
  </button>

  <!-- 4. BOTTOM NAV: Fixed, blurred background -->
  <nav class="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-40 pb-5 pt-3">
    <div class="flex justify-around items-center px-2">
      <button class="flex flex-col items-center gap-1 p-2 w-16">
        <span class="material-icons text-xl text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">home</span>
        <span class="text-[10px] font-medium text-primary">Home</span>
      </button>
      <button class="flex flex-col items-center gap-1 p-2 w-16 text-muted-foreground hover:text-foreground transition-colors">
        <span class="material-icons text-xl">search</span>
        <span class="text-[10px] font-medium">Search</span>
      </button>
      <button class="flex flex-col items-center gap-1 p-2 w-16 text-muted-foreground hover:text-foreground transition-colors">
        <span class="material-icons text-xl">favorite_border</span>
        <span class="text-[10px] font-medium">Saved</span>
      </button>
      <button class="flex flex-col items-center gap-1 p-2 w-16 text-muted-foreground hover:text-foreground transition-colors">
        <span class="material-icons text-xl">person_outline</span>
        <span class="text-[10px] font-medium">Profile</span>
      </button>
    </div>
  </nav>

</div>

CRITICAL: Root uses 'min-h-screen' to fill frame height but can grow taller. Main uses 'flex-1' for content.
`;

// ---------------------------------------------------------------------------
// 4. PREMIUM COMPONENT PATTERNS
// ---------------------------------------------------------------------------
const COMPONENT_PATTERNS = `
[BALANCE_HERO] - Large balance display
<div class="mb-8 mt-2">
  <div class="flex items-center justify-between mb-2">
    <span class="text-sm font-medium text-muted-foreground/80 uppercase tracking-wider">Total Balance</span>
    <button class="size-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted transition-colors">
      <span class="material-icons text-lg">visibility</span>
    </button>
  </div>
  <div class="flex items-end gap-2 mb-4">
    <span class="text-5xl font-bold font-heading tracking-tighter text-foreground">$12,450<span class="text-muted-foreground">.24</span></span>
  </div>
  <div class="flex gap-3">
    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
      <span class="material-icons text-sm text-emerald-400">arrow_upward</span>
      <span class="text-xs font-bold text-emerald-400">+8.2%</span>
    </div>
    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border">
      <span class="text-xs font-medium text-muted-foreground">vs last month</span>
    </div>
  </div>
</div>

[GRADIENT_BORDER_CARD] - Card with glowing border
<div class="relative group">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-purple-600 rounded-xl opacity-40 blur"></div>
  <div class="relative bg-card rounded-xl p-4 border border-white/10 overflow-hidden">
    <div class="flex items-center gap-2 mb-3">
      <div class="size-6 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center">
        <span class="material-icons text-xs text-white">star</span>
      </div>
      <h3 class="font-heading font-bold text-sm bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Featured</h3>
    </div>
    <p class="text-sm text-muted-foreground leading-relaxed">Your content here with <span class="text-accent font-semibold">highlighted</span> text.</p>
  </div>
</div>

[STAT_CARD_WITH_GLOW] - Icon with glow effect
<div class="bg-card rounded-xl p-4 border border-border flex flex-col items-center justify-center relative overflow-hidden">
  <div class="absolute top-0 right-0 p-3 opacity-20">
    <span class="material-icons text-5xl text-orange-500">local_fire_department</span>
  </div>
  <div class="relative z-10 flex flex-col items-center">
    <div class="size-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
      <span class="material-icons text-xl text-orange-500">local_fire_department</span>
    </div>
    <span class="text-3xl font-bold font-heading text-foreground mb-1">12</span>
    <span class="text-xs font-semibold text-orange-400 uppercase tracking-wider">Day Streak</span>
  </div>
</div>

[TRANSACTION_ITEM] - List item with icon
<div class="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
  <div class="flex items-center gap-3">
    <div class="size-10 rounded-full bg-blue-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
      <span class="material-icons text-lg text-blue-400">shopping_cart</span>
    </div>
    <div class="flex flex-col">
      <span class="text-sm font-semibold">Whole Foods</span>
      <span class="text-xs text-muted-foreground">Groceries • Today</span>
    </div>
  </div>
  <span class="font-bold text-sm text-foreground">-$84.20</span>
</div>

[FILTER_CHIPS] - Horizontal scrolling chips
<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
  <button class="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-primary/20 whitespace-nowrap">All</button>
  <button class="px-5 py-2 rounded-full bg-secondary border border-border text-muted-foreground font-medium text-xs whitespace-nowrap">Category</button>
</div>

[DATE_DIVIDER] - Section divider with date
<div class="flex items-center justify-between mb-3">
  <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">October 26</span>
  <div class="h-px flex-1 bg-border ml-4"></div>
</div>

[QUICK_STATS_ROW] - 3-column stats
<div class="grid grid-cols-3 gap-3">
  <div class="bg-card p-3 rounded-xl border border-border flex flex-col gap-2">
    <span class="material-icons text-lg text-chart-1">account_balance_wallet</span>
    <div>
      <p class="text-[10px] text-muted-foreground uppercase">Spent</p>
      <p class="text-sm font-bold">$2,140</p>
    </div>
  </div>
  <!-- Repeat for other stats -->
</div>

[SUMMARY_BAR] - Fixed summary at bottom
<div class="fixed bottom-[88px] left-6 right-6 z-20">
  <div class="bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl overflow-hidden relative">
    <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
    <div class="grid grid-cols-3 divide-x divide-border">
      <div class="flex flex-col items-center">
        <span class="text-[10px] text-muted-foreground uppercase font-bold">Income</span>
        <span class="text-sm font-bold text-emerald-400">+$3,500</span>
      </div>
      <!-- More columns -->
    </div>
  </div>
</div>
`;

// ---------------------------------------------------------------------------
// 5. IMAGE LIBRARY
// ---------------------------------------------------------------------------
const IMAGE_LIBRARY = `
VALID UNSPLASH IDs (Use format: https://images.unsplash.com/photo-[ID]?w=800&fit=crop):
- People: 'photo-1494790108377-be9c29b29330', 'photo-1507003211169-0a1dd7228f2d', 'photo-1517849845537-4d257902454a'
- Tech: 'photo-1550751827-4bd374c3f58b', 'photo-1518770660439-4636190af475'
- Fashion: 'photo-1489987707025-afc232f7ea0f', 'photo-1558171813-4c088753af8f'
- Products: 'photo-1542291026-7eec264c27ff', 'photo-1523275335684-37898b6baf30'
- Cyber/Neon: 'photo-1550684848-fac1c5b4e853', 'photo-1515630278258-407f66498911'
- Nature: 'photo-1506905925346-21bda4d32df4', 'photo-1507525428034-b723cf961d3e'
- Food: 'photo-1495474472287-4d71bcdd2085', 'photo-1546069901-ba9599a7e63c'
`;

// ---------------------------------------------------------------------------
// 6. GENERATION TEMPLATE
// ---------------------------------------------------------------------------
export const generationTemplate = PromptTemplate.fromTemplate(
  `You are an Elite UI Architect creating AWARD-WINNING mobile screens.
Every pixel matters. Users should be IMPRESSED at first glance.

USER REQUEST: "{message}"

CONTEXT:
{colorPaletteInstructions}

═══════════════════════════════════════════════════════════════════════════════
STEP 1: SELECT YOUR VIBE
═══════════════════════════════════════════════════════════════════════════════

*INSTRUCTION*: Invent a unique, high-end visual aesthetic tailored specifically to the user's intent. Do not use generic or repetitive styles.

═══════════════════════════════════════════════════════════════════════════════
STEP 2: USE THE LAYOUT SHELL
═══════════════════════════════════════════════════════════════════════════════
` + LAYOUT_SHELL_INSTRUCTION + `

═══════════════════════════════════════════════════════════════════════════════
STEP 3: USE PREMIUM PATTERNS
═══════════════════════════════════════════════════════════════════════════════
` + QUALITY_GUIDELINES + `

` + COMPONENT_PATTERNS + `

` + IMAGE_LIBRARY + `

═══════════════════════════════════════════════════════════════════════════════
PREVIOUS SCREENS (Match this style):
{previousScreensContext}

═══════════════════════════════════════════════════════════════════════════════
SCREEN SPEC:
Title: {title}
Description: {description}
Details: {prompt}

═══════════════════════════════════════════════════════════════════════════════
CRITICAL RULES:
1.  **FILL THE SCREEN**: Root div MUST have 'h-full w-full overflow-hidden'. Main uses 'flex-1 overflow-y-auto pb-32'.
2.  **HEADER SPACING**: Use 'pt-12 pb-4' for header to account for status bar.
3.  **SHADOWS & GLOWS**: Every card needs shadows. Use colored glows: 'shadow-[0_0_15px_rgba(R,G,B,0.3)]'.
4.  **GRADIENT EVERYTHING**: Gradient text, gradient borders, gradient buttons.
5.  **Real Images**: Use Unsplash IDs. Profile images need gradient ring effect.
6.  **Navigation Consistency**: Copy bottom nav exactly from previousScreensContext if it exists.
7.  **NO BOILERPLATE**: No <!DOCTYPE>, <html>, <body>. Return <link>, <style>, and the root div.

OUTPUT FORMAT (JSON only):
{{
  "html": "MINIFIED_HTML_STRING",
  "title": "string",
  "description": "string"
}}
`
);

// ---------------------------------------------------------------------------
// 7. PLANNING TEMPLATE
// ---------------------------------------------------------------------------
export const planningTemplate = PromptTemplate.fromTemplate(
  `You are a Lead Product Designer architecting a premium mobile experience.

USER REQUEST: "{message}"

STRATEGY:
1.  **Vibe Selection**: Design a bespoke, high-end visual aesthetic from scratch based on the user's unique industry and intent.
2.  **Visual Hallucination**: If the user's request is simple, you MUST elaborate it into a high-end designer's vision. Never plan a "standard list"; plan a "dynamic feed with depth, layered blurs, and sophisticated typography."
3.  **Layout Logic**: Be creative with layout grids. Use asymmetric grids, complex bento systems, or layered stacks to create visual interest.
4.  **Flow**: 3-5 screens max. Quality over quantity.

MANDATORY PROMPT DEPTH (Every 'prompt' field MUST follow this structure):
- **Visual Style**: Define the specific lighting, lighting effects, and depth.
- **Layout Architecture**: Specify if it is Bento, Stacked, Layered, or Asymmetric.
- **Micro-Details**: Mention specific shadow weights, gradient directions (e.g., to-tr), and blur values.
- **Example Data**: Define the exactly premium-sounding data points (not just "user name", use "Alexander Sterling").

DETAILED PROMPT EXAMPLE:
"Style: Ultra-Premium Luxury Dark. Layout: Layered Bento Grid. Background uses a deep slate-950 with subtle radial gradients. Cards use 'bg-card/40 backdrop-blur-xl' with dual-layered shadows (one soft, one colored glow). Typography utilizes massive tracking-tighter headers. Content: A sophisticated investment dashboard showing real-time market delta (+12.4%), premium account stats for 'Sterling Private Vault', and sleek glassmorphic transaction cards with custom icon glows."

OUTPUT SCHEMA (JSON):
{{
  "totalScreens": number,
  "screenPrompts": [
    {{ 
      "id": "uuid",
      "title": "Short Title", 
      "prompt": "Detailed spec including a UNIQUE VISUAL AESTHETIC, bespoke LAYOUT structure, CONTENT sections, KEY COMPONENTS, and SPECIFIC DATA POINTS.", 
      "order": number 
    }}
  ]
}}
`
);

// ---------------------------------------------------------------------------
// 8. UPDATE TEMPLATE
// ---------------------------------------------------------------------------
export const updateTemplate = PromptTemplate.fromTemplate(
  `You are a Senior Frontend Engineer refining an existing screen.
Preserve the established VIBE and STYLE.

Request: "{message}"

System Context: 
{colorPaletteInstructions}

Current Screen Context:
{previousScreensContext}

INSTRUCTIONS:
1.  **Preserve Style**: Maintain the established bespoke visual aesthetic and mood.
2.  **Preserve Layout**: Keep 'min-h-screen w-full overflow-x-hidden relative' on root container. Keep 'flex-1 overflow-y-auto pb-32' on main.
3.  **Refine**: Make the specific requested change.
4.  **NO BOILERPLATE**: No <!DOCTYPE>. Return fonts/styles + root div.

Output (JSON):
{{ "html": "...", "title": "...", "description": "..." }}
`
);

export const designSystemInstructions = QUALITY_GUIDELINES;

// Force hot reload: switched to Material Icons 2026-02-06
