
import { PromptTemplate } from '@langchain/core/prompts';

// ---------------------------------------------------------------------------
// 1. CORE QUALITY PRINCIPLES (The "Physics" of the app)
// ---------------------------------------------------------------------------
// We replaced "Strict One Truth" with "Quality Guidelines" to allow for stylistic diversity (Neon, Retro, etc.)
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
   - Cells: distinct 'bg-card' blocks.
   - Spans: Use 'col-span-2' for main cards (Charts, Maps).
   - Density: Higher density, 'p-4' inside cards.

D. **"Neo-Brutalist"**:
   - Card: 'border-2 border-black shadow-[4px_4px_0px_black] rounded-lg'.
   - Colors: High saturation, clashing colors.
`;

// ---------------------------------------------------------------------------
// 3. LAYOUT SHELL (The Frame)
// ---------------------------------------------------------------------------
const LAYOUT_SHELL_INSTRUCTION = `
MANDATORY ROOT CONTAINER (DO NOT wrap in html/body):
<div class="w-full min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 relative flex flex-col">

  <!-- 1. HEADER (Adaptive) -->
  <header class="h-16 flex items-center justify-between px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/10 transition-all">
    <button class="size-10 flex items-center justify-center rounded-full active:bg-accent/50 text-foreground/80 hover:bg-muted/50 transition-colors">
      <i class="ri-arrow-left-line text-xl"></i>
    </button>
    <span class="font-bold text-lg tracking-tight">Title</span>
    <button class="size-10 flex items-center justify-center rounded-full active:bg-accent/50 text-foreground/80 hover:bg-muted/50 transition-colors">
      <i class="ri-settings-4-line text-xl"></i>
    </button>
  </header>

  <!-- 2. MAIN CANVAS (Flexible) -->
  <!-- NOTE: The 'p-5' padding is a baseline. You may adjust or remove padding on this element if full-bleed is needed. -->
  <main class="flex-1 w-full max-w-full overflow-y-auto no-scrollbar p-5 pb-32">
    <!-- YOUR LAYOUT CONTAINER GOES HERE (e.g. <div class="grid..."> or <div class="flex flex-col...">) -->
  </main>

  <!-- 3. DOCK (Fixed Bottom) -->
  <nav class="fixed bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur-2xl border-t border-border/10 pb-6 pt-4 px-8 flex justify-between items-center z-50 shadow-2xl">
    <button class="flex flex-col items-center gap-1 text-primary active:scale-90 transition-transform">
      <i class="ri-home-fill text-xl"></i>
      <!-- No label for cleaner look, or small label -->
    </button>
    <button class="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground active:scale-90 transition-transform">
      <i class="ri-search-line text-xl"></i>
    </button>
    <!-- Add a functional FAB if needed -->
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
// 4. COMPONENT LIBRARY (Starters)
// ---------------------------------------------------------------------------
const COMPONENT_PATTERNS = `
[BUTTON_PRIMARY] - Adapt roundedness/shadow to vibe
<button class="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
  <span>Action</span>
  <i class="ri-arrow-right-line"></i>
</button>

[CARD_BENTO] - Perfect for grids
<div class="p-5 rounded-2xl bg-card border border-border/40 relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-colors">
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

[LIST_ITEM_TRANSACTION]
<div class="flex items-center justify-between p-4 rounded-xl bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
  <div class="flex items-center gap-3">
    <div class="size-10 rounded-full bg-muted flex items-center justify-center text-xl">🍔</div>
    <div class="flex flex-col">
      <span class="font-bold text-sm">Burger King</span>
      <span class="text-xs text-muted-foreground">Food & Dining</span>
    </div>
  </div>
  <span class="font-mono font-medium text-foreground">-$14.50</span>
</div>
`;

// ---------------------------------------------------------------------------
// 5. GENERATION TEMPLATE (The Builder)
// ---------------------------------------------------------------------------
export const generationTemplate = PromptTemplate.fromTemplate(
  `You are an Adaptive UI Architect.
Your goal is to build a PRODUCTION-GRADE mobile screen that matches the USER'S VIBE explicitly.

USER REQUEST: "{message}"

CONTEXT:
{colorPaletteInstructions}

/// STEP 1: SELECT YOUR VIBE ///
` + STYLE_ADAPTERS + `
*INSTRUCTION*: If the user asks for "Neon" or "Dark", YOU MUST use the Neon/Cyberpunk styles. Do not default to "Clean" if the prompt implies personality (e.g. "Gaming", "Vibe", "Energy").

/// STEP 2: SELECT YOUR LAYOUT ///
- **Standard**: <div class="flex flex-col gap-5">...</div>
- **Bento/Dashboard**: <div class="grid grid-cols-2 gap-3"> (Use col-span-2 for big blocks)</div>

/// STEP 3: USE RESOURCES ///
` + QUALITY_GUIDELINES + `

` + COMPONENT_PATTERNS + `

` + LAYOUT_SHELL_INSTRUCTION + `

PREVIOUS SCREENS:
{previousScreensContext}

═══════════════════════════════════════════════════════════════════════════════
SCREEN SPEC:
Title: {title}
Description: {description}
Details: {prompt}

CRITICAL RULES:
1.  **Respect the Vibe**: If "Gen Z" or "Neon" is requested, use 'bg-black', 'text-white', and 'shadow-[color]'. Do NOT make it a boring white admin panel.
2.  **Flexible Layout**: don't be afraid of Grids.
3.  **Real Images**: 
    - People: 'photo-1517849845537-4d257902454a'
    - Tech: 'photo-1550751827-4bd374c3f58b'
    - Cyber/Neon: 'photo-1550684848-fac1c5b4e853', 'photo-1515630278258-407f66498911'
    - Minimal: 'photo-1494438639946-1ebd1d20bf85'
4.  **Navigation Consistency**: CHECK {{previousScreensContext}}. If a Bottom Navigation exists, YOU MUST COPY IT EXACTLY (same icons, same order). Do not generate a random new one.
5.  **NO STRUCTURAL BOILERPLATE**: DO NOT include "<!DOCTYPE html>", "<html>", "<head>", or "<body>" tags. The output MUST start directly with the main <div class="w-full..."> wrapper. Any content outside this div will break the app.

OUTPUT FORMAT:
Return ONLY a valid JSON object.
{{
  "html": "MINIFIED_HTML_STRING",
  "title": "string",
  "description": "string"
}}
`
);

// ---------------------------------------------------------------------------
// 6. PLANNING TEMPLATE (The Architect)
// ---------------------------------------------------------------------------
export const planningTemplate = PromptTemplate.fromTemplate(
  `You are the Lead Product Designer.
Architect a user journey that feels tailor-made for the request.

USER REQUEST: "{message}"

STRATEGY:
1.  **Vibe Check**: Is this a professional tool (Clean) or a lifestyle app (Neon/Bento)?
2.  **Layout Logic**: 
    - "Bento" -> Mention "Grid Layout" in the prompt.
    - "Feed" -> Mention "Vertical List".
3.  **Flow**: 3-5 screens max.

OUTPUT SCHEMA (JSON):
{{
  "totalScreens": number,
  "screenPrompts": [
    {{ 
      "id": "uuid",
      "title": "Short Title", 
      "prompt": "Detailed spec including VIBE (Neon/Clean), LAYOUT (Grid/List), and CONTENT.", 
      "order": number 
    }}
  ]
}}
`
);

// ---------------------------------------------------------------------------
// 7. UPDATE TEMPLATE
// ---------------------------------------------------------------------------
export const updateTemplate = PromptTemplate.fromTemplate(
  `You are a Senior Frontend Engineer.
Refine the screen while preserving the ESTABLISHED VIBE (Neon/Clean/Bento).

Request: "{message}"

System Context: 
{colorPaletteInstructions}

Current Screen Context:
{previousScreensContext}

INSTRUCTIONS:
1.  **Preserve Style**: If the current screen is "Neon Dark", do NOT turn it white. Keep the classes.
2.  **Refine**: Make the specific requested change.
3.  **Fix Layouts**: If converting to Bento, switch the main wrapper to 'grid grid-cols-2'.
4.  **NO STRUCTURAL BOILERPLATE**: Return ONLY the inner content starting with the main wrapper div. NO "<!DOCTYPE html>", "<html>", or "<body>".

Output Single JSON:
{{ "html": "...", "title": "...", "description": "..." }}
`
);

export const designSystemInstructions = QUALITY_GUIDELINES;
