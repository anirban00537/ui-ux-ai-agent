import { PromptTemplate } from '@langchain/core/prompts';

// ---------------------------------------------------------------------------
// 1. CORE QUALITY PRINCIPLES (The "Physics" of the app)
// ---------------------------------------------------------------------------
const QUALITY_GUIDELINES = `
CORE QUALITY CHECKLIST (Non-Negotiable UX Rules):
1.  **Touch Targets**: Buttons/Inputs must be min-h-[44px] (h-12 or h-14).
2.  **Hierarchy**: 
    - Headings: 'font-bold tracking-tight' (Use size to distinguish).
    - Body: 'text-sm text-muted-foreground' (Never pure black/white).
3.  **Realism**: 
    - Images: MUST use valid Unsplash IDs (provided below).
    - Data: Real names, prices, dates. No "Lorem Ipsum".
4.  **Interaction**:
    - Buttons: 'active:scale-95 transition-all'.
    - Cards: 'active:opacity-90' or 'hover:bg-accent/50'.
5.  **Layout**: No fixed widths (w-[300px]). Use 'w-full', 'flex-1', or grid-cols.
6.  **Shadows**: Every card needs 'shadow-sm' or 'shadow-lg'. No flat designs.
7.  **Gradients**: Use 'bg-gradient-to-br from-X to-Y' for hero sections and CTAs.
`;

// ---------------------------------------------------------------------------
// 2. STYLE ADAPTERS (The "Vibe" Engine)
// ---------------------------------------------------------------------------
const STYLE_ADAPTERS = `
STYLE ADAPTERS (Apply based on User Request):

A. **"Clean / Apple / Minimal"** (Default):
   - Bg: 'bg-background' (White/Dark).
   - Card: 'bg-card border border-border/40 shadow-sm rounded-3xl'.
   - Spacing: 'p-6 gap-6'.

B. **"Neon / Cyberpunk / Gamer"**:
   - Bg: 'bg-slate-950' (Deep dark).
   - Card: 'bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl shadow-[0_0_15px_rgba(var(--primary),0.3)]'.
   - Text: 'text-white' with 'text-primary' glowing accents.
   - Decor: Use gradients like 'bg-gradient-to-r from-primary/20 to-purple-500/20'.

C. **"Bento Grid / Dashboard"**:
   - Layout: 'grid grid-cols-2 gap-3'.
   - Cells: distinct 'bg-card' blocks with shadows.
   - Spans: Use 'col-span-2' for main cards (Charts, Maps).
   - Density: Higher density, 'p-4' inside cards.

D. **"Neo-Brutalist"**:
   - Card: 'border-2 border-black shadow-[4px_4px_0px_black] rounded-lg'.
   - Colors: High saturation, clashing colors.

E. **"Premium Dark / Luxury"**:
   - Bg: 'bg-zinc-950' or 'bg-slate-950'.
   - Card: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-xl'.
   - Buttons: 'bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30'.
   - Decorative orbs: Blurred circles with 'bg-primary/20 blur-3xl'.
`;

// ---------------------------------------------------------------------------
// 3. LAYOUT SHELL (The Frame) - CRITICAL: min-h-screen for proper height!
// ---------------------------------------------------------------------------
const LAYOUT_SHELL_INSTRUCTION = `
MANDATORY ROOT CONTAINER (DO NOT wrap in html/body):
<div class="w-full min-h-[1100px] bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 relative flex flex-col">

  <!-- 1. HEADER (Premium floating) -->
  <header class="h-16 flex items-center justify-between px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/10 transition-all">
    <button class="size-10 flex items-center justify-center rounded-full active:bg-accent/50 text-foreground/80 hover:bg-muted/50 transition-colors">
      <i class="ri-arrow-left-line text-xl"></i>
    </button>
    <span class="font-bold text-lg tracking-tight">Title</span>
    <button class="size-10 flex items-center justify-center rounded-full active:bg-accent/50 text-foreground/80 hover:bg-muted/50 transition-colors">
      <i class="ri-settings-4-line text-xl"></i>
    </button>
  </header>

  <!-- 2. MAIN CANVAS (Flexible - flex-1 fills remaining space) -->
  <main class="flex-1 w-full max-w-full overflow-y-auto no-scrollbar p-5 pb-32">
    <!-- YOUR LAYOUT CONTAINER GOES HERE -->
    <!-- Use flex-1 on child containers to fill space if content is minimal -->
  </main>

  <!-- 3. DOCK (Fixed Bottom) -->
  <nav class="fixed bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur-2xl border-t border-border/10 pb-6 pt-4 px-8 flex justify-between items-center z-50 shadow-2xl">
    <button class="flex flex-col items-center gap-1 text-primary active:scale-90 transition-transform">
      <i class="ri-home-fill text-xl"></i>
    </button>
    <button class="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground active:scale-90 transition-transform">
      <i class="ri-search-line text-xl"></i>
    </button>
    <button class="size-12 -mt-8 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/40 flex items-center justify-center transform hover:scale-105 transition-all">
      <i class="ri-add-line text-2xl"></i>
    </button>
    <button class="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground active:scale-90 transition-transform">
      <i class="ri-pie-chart-line text-xl"></i>
    </button>
    <button class="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground active:scale-90 transition-transform">
      <i class="ri-user-line text-xl"></i>
    </button>
  </nav>

</div>
`;

// ---------------------------------------------------------------------------
// 4. PREMIUM COMPONENT LIBRARY
// ---------------------------------------------------------------------------
const COMPONENT_PATTERNS = `
[BUTTON_PRIMARY] - Premium CTA with shadow
<button class="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
  <span>Action</span>
  <i class="ri-arrow-right-line"></i>
</button>

[HERO_CARD] - Featured content with image overlay
<div class="relative rounded-3xl overflow-hidden shadow-xl">
  <img src="https://images.unsplash.com/photo-..." class="w-full aspect-[16/10] object-cover" />
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
  <div class="absolute bottom-0 left-0 right-0 p-5">
    <span class="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-sm">FEATURED</span>
    <h2 class="text-2xl font-bold text-white mb-1">Bold Statement</h2>
    <p class="text-white/70 text-sm">Supporting text</p>
  </div>
</div>

[GLASS_STAT_CARD] - For metrics with depth
<div class="relative p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden">
  <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl"></div>
  <div class="relative">
    <div class="flex items-center gap-2 mb-3">
      <div class="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
        <i class="ri-icon-name text-lg"></i>
      </div>
      <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</span>
    </div>
    <p class="text-3xl font-bold tracking-tight">$1,240</p>
  </div>
</div>

[CARD_BENTO] - Perfect for grids
<div class="p-5 rounded-2xl bg-card border border-border/40 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-colors">
  <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
    <i class="ri-icon-name text-5xl"></i>
  </div>
  <div class="flex items-center gap-3 mb-2">
    <div class="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
       <i class="ri-icon-name text-lg"></i>
    </div>
    <span class="font-medium text-sm text-muted-foreground">Label</span>
  </div>
  <div class="text-2xl font-bold tracking-tight">$1,240.00</div>
</div>

[LIST_ITEM_RICH] - Premium list item with image
<div class="flex items-center gap-4 p-4 rounded-2xl bg-card/50 hover:bg-card border border-border/50 hover:border-border transition-all cursor-pointer">
  <div class="relative shrink-0">
    <img src="..." class="size-14 rounded-xl object-cover shadow-md ring-1 ring-black/5" />
    <div class="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
      <i class="ri-check-line text-white text-[10px]"></i>
    </div>
  </div>
  <div class="flex-1 min-w-0">
    <h4 class="font-semibold truncate">Product Name</h4>
    <p class="text-sm text-muted-foreground">Category</p>
  </div>
  <div class="text-right shrink-0">
    <p class="font-mono font-bold">$49.99</p>
    <p class="text-xs text-emerald-500">In Stock</p>
  </div>
</div>

[CATEGORY_CHIPS] - Filter pills with active state
<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
  <button class="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/20 shrink-0">Active</button>
  <button class="px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium hover:bg-muted transition-colors shrink-0">Category</button>
</div>

[SECTION_HEADER] - With accent bar
<div class="flex items-center justify-between mb-4">
  <div class="flex items-center gap-2">
    <div class="w-1 h-5 rounded-full bg-primary"></div>
    <h3 class="font-bold text-lg">Section Title</h3>
  </div>
  <button class="text-sm text-primary font-medium hover:underline">See All</button>
</div>
`;

// ---------------------------------------------------------------------------
// 5. IMAGE LIBRARY
// ---------------------------------------------------------------------------
const IMAGE_LIBRARY = `
VALID UNSPLASH IDs (Use format: https://images.unsplash.com/photo-[ID]?w=800&fit=crop):
- People: 'photo-1494790108377-be9c29b29330', 'photo-1517849845537-4d257902454a', 'photo-1507003211169-0a1dd7228f2d'
- Tech: 'photo-1550751827-4bd374c3f58b', 'photo-1518770660439-4636190af475'
- Fashion: 'photo-1489987707025-afc232f7ea0f', 'photo-1558171813-4c088753af8f'
- Products: 'photo-1542291026-7eec264c27ff', 'photo-1523275335684-37898b6baf30'
- Cyber/Neon: 'photo-1550684848-fac1c5b4e853', 'photo-1515630278258-407f66498911'
- Nature: 'photo-1506905925346-21bda4d32df4', 'photo-1507525428034-b723cf961d3e'
- Food: 'photo-1495474472287-4d71bcdd2085', 'photo-1546069901-ba9599a7e63c'
`;

// ---------------------------------------------------------------------------
// 6. GENERATION TEMPLATE (The Builder)
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
` + STYLE_ADAPTERS + `

*INSTRUCTION*: Match the vibe to the request. "Gaming/Neon/Dark" = Neon styles. "Finance/Pro" = Clean/Apple.

═══════════════════════════════════════════════════════════════════════════════
STEP 2: SELECT YOUR LAYOUT
═══════════════════════════════════════════════════════════════════════════════
- **Standard**: <div class="flex flex-col gap-5">...</div>
- **Bento/Dashboard**: <div class="grid grid-cols-2 gap-3">...</div> (Use col-span-2 for hero cards)
- **Feed**: Vertical scrolling list with rich items

═══════════════════════════════════════════════════════════════════════════════
STEP 3: USE RESOURCES
═══════════════════════════════════════════════════════════════════════════════
` + QUALITY_GUIDELINES + `

` + COMPONENT_PATTERNS + `

` + IMAGE_LIBRARY + `

` + LAYOUT_SHELL_INSTRUCTION + `

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
1.  **FILL THE SCREEN**: Root div MUST have 'min-h-[1100px]'. Main content uses 'flex-1'.
2.  **Respect the Vibe**: Neon = dark backgrounds, glowing shadows. Clean = white, subtle shadows.
3.  **SHADOWS EVERYWHERE**: Cards need 'shadow-sm' or 'shadow-lg'. Buttons need 'shadow-lg shadow-primary/30'.
4.  **GRADIENTS FOR MAGIC**: Hero sections use 'bg-gradient-to-br/t'. Buttons use 'bg-gradient-to-r'.
5.  **Real Images**: Use the Unsplash IDs above. Always add gradient overlays to images.
6.  **Navigation Consistency**: Copy bottom nav exactly from previousScreensContext if it exists.
7.  **NO BOILERPLATE**: No <!DOCTYPE>, <html>, <head>, <body>. Start with <div class="w-full min-h-[1100px]...">

OUTPUT FORMAT (JSON only):
{{
  "html": "MINIFIED_HTML_STRING",
  "title": "string",
  "description": "string"
}}
`
);

// ---------------------------------------------------------------------------
// 7. PLANNING TEMPLATE (The Architect)
// ---------------------------------------------------------------------------
export const planningTemplate = PromptTemplate.fromTemplate(
  `You are a Lead Product Designer architecting a premium mobile experience.

USER REQUEST: "{message}"

STRATEGY:
1.  **Vibe Check**: Professional tool (Clean) or lifestyle app (Neon/Premium Dark)?
2.  **Layout Logic**: 
    - "Bento/Dashboard" -> Mention "Grid Layout" in prompts.
    - "Feed/Social" -> Mention "Vertical List with rich items".
3.  **Flow**: 3-5 screens max. Quality over quantity.

OUTPUT SCHEMA (JSON):
{{
  "totalScreens": number,
  "screenPrompts": [
    {{ 
      "id": "uuid",
      "title": "Short Title", 
      "prompt": "Detailed spec including VIBE (Neon/Clean/Premium Dark), LAYOUT (Grid/List), CONTENT sections, and KEY COMPONENTS.", 
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
1.  **Preserve Style**: Keep existing vibe (Neon stays Neon, Clean stays Clean).
2.  **Preserve Height**: Keep 'min-h-[1100px]' on root. Keep 'flex-1' on main.
3.  **Refine**: Make the specific requested change.
4.  **NO BOILERPLATE**: Return only the root div. No <!DOCTYPE>, <html>, or <body>.

Output (JSON):
{{ "html": "...", "title": "...", "description": "..." }}
`
);

export const designSystemInstructions = QUALITY_GUIDELINES;
