
import { PromptTemplate } from '@langchain/core/prompts';

// ---------------------------------------------------------------------------
// 1. THE GOLD STANDARD (ONE STRICT TRUTH)
// ---------------------------------------------------------------------------
// instead of vague options, we define ONE top-tier mobile aesthetic (Clean, Modern, Shadcn-like)
const GOLD_STANDARD_AESTHETIC = `
STRICT VISUAL RULES (Follow these or fail):
1.  **Surfaces**: 
    - PRIMARY BG: 'bg-background' (clean white/dark).
    - CARDS: 'bg-card border border-border/50 shadow-sm'.
    - DO NOT use extensive gray backgrounds; use white space + borders.
2.  **Typography**:
    - HEADINGS: 'font-bold tracking-tight text-foreground'.
    - SUBTEXT: 'text-sm text-muted-foreground'.
    - DATA: 'font-mono text-xs text-foreground/80'.
3.  **Spacing (The Anti-Cramp Rule)**:
    - DEFAULT PADDING: 'p-5' or 'p-6'.
    - SECTION GAP: 'gap-6'.
    - ITEM GAP: 'gap-3'.
4.  **Radii**:
    - OUTER: 'rounded-3xl' (Screen corners).
    - CARDS: 'rounded-2xl'.
    - BUTTONS: 'rounded-xl'.
    - INNER: 'rounded-lg'.
5.  **Interactions (Mandatory)**:
    - BUTTONS: 'active:scale-95 transition-all duration-200'.
    - CARDS: 'active:bg-accent/50 transition-colors duration-200'.
`;

const LAYOUT_SHELL_INSTRUCTION = `
MANDATORY HTML STRUCTURE:
<div class="w-full min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden decoration-clone selection:bg-primary/20">

  <!-- 1. STICKY HEADER (If needed, otherwise remove) -->
  <header class="h-14 flex items-center justify-between px-5 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
    <button class="size-10 flex items-center justify-center rounded-full active:bg-accent text-muted-foreground">
      <i class="ri-arrow-left-line text-xl"></i>
    </button>
    <span class="font-semibold text-lg">Title</span>
    <div class="size-10"></div> <!-- Spacer -->
  </header>

  <!-- 2. SCROLLABLE CONTENT (MUST use flex-1 to push footer down) -->
  <main class="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col gap-6 pb-24">
    <!-- YOUR GENERATED CONTENT GOES HERE -->
  </main>

  <!-- 3. BOTTOM NAVIGATION (Fixed, Floating, or Tab Bar) -->
  <nav class="fixed bottom-0 w-full bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-[80px]">
    <!-- Tab Items... -->
  </nav>

</div>
`;

// ---------------------------------------------------------------------------
// 2. COMPONENT LOOKUP TABLE (Reference)
// ---------------------------------------------------------------------------
const COMPONENT_PATTERNS = `
[BUTTON_PRIMARY]
<button class="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
  <span>Label</span>
  <i class="ri-arrow-right-line"></i>
</button>

[BUTTON_SECONDARY]
<button class="h-10 px-4 rounded-lg border border-border bg-card text-foreground font-medium shadow-sm hover:bg-accent active:scale-95 transition-all">
  Label
</button>

[CARD_FEATURE]
<div class="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col gap-3 active:border-primary/50 transition-colors">
  <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
    <i class="ri-star-fill text-xl"></i>
  </div>
  <h3 class="font-bold text-lg">Feature Title</h3>
  <p class="text-sm text-muted-foreground leading-relaxed">Description goes here.</p>
</div>

[INPUT_FIELD]
<div class="space-y-2">
  <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Label</label>
  <input class="w-full h-12 rounded-xl border border-input bg-muted/20 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="...">
</div>
`;

// ---------------------------------------------------------------------------
// 3. GENERATION TEMPLATE
// ---------------------------------------------------------------------------
export const generationTemplate = PromptTemplate.fromTemplate(
  `You are a Senior Frontend Engineer specialized in Tailwind CSS. 
Your ONLY job is to write production-grade, pixel-perfect HTML code for a mobile app screen.

USER REQUEST: "{message}"

CONTEXT:
{colorPaletteInstructions}

AESTHETIC RULES:
` + GOLD_STANDARD_AESTHETIC + `

COMPONENT REFERENCE:
` + COMPONENT_PATTERNS + `

LAYOUT SHELL:
` + LAYOUT_SHELL_INSTRUCTION + `

PREVIOUS SCREENS:
{previousScreensContext}

═══════════════════════════════════════════════════════════════════════════════
SCREEN SPEC:
Title: {title}
Description: {description}
Details: {prompt}

REQUIREMENTS:
1. **NO CUSTOM CSS**. Use only Tailwind classes.
2. **NO PLACEHOLDERS**. Fill with realistic, high-quality data (names, prices, metrics).
3. **ICONS**: Use <i class="ri-name-line"></i> or <i class="ri-name-fill"></i> for everything.
4. **IMAGES**: Use <img src="https://images.unsplash.com/photo-..." class="bg-muted object-cover ...">.
5. **INTERACTIVITY**: Every button/card MUST have 'active:scale-95' or 'hover:bg-accent'.
6. **SCROLL**: Main content must be 'flex-1 overflow-y-auto no-scrollbar'.
7. **NAV**: If this is a main screen, include the Bottom Tab Bar.
8. **COLORS**: Strictly use (bg-background, text-foreground, bg-card, bg-primary, text-primary-foreground).

You must output a single valid JSON object:
{{
  "html": "MINIFIED_HTML_STRING",
  "title": "string",
  "description": "string"
}}
`
);

// ---------------------------------------------------------------------------
// 4. PLANNING TEMPLATE (Architect)
// ---------------------------------------------------------------------------
export const planningTemplate = PromptTemplate.fromTemplate(
  `You are the Lead User Experience Architect.
Your goal is to break down a user request into a set of precise, high-fidelity screen specifications.

USER REQUEST: "{message}"

STRATEGY:
1.  **Analyze**: What are the 3-5 key screens needed to solve this problem? (Don't over-engineer, typically 3-4 is enough).
2.  **Flow**: Start with the most important screen (e.g. Dashboard) -> then Details -> then Settings/Profile.
3.  **Detail**: For each screen, write a "Developer Spec" that describes the COMPONENTS, DATA, and LAYOUT.

EXAMPLE OUTPUT for "Crypto App":
- Screen 1: "Dashboard": Hero showing total balance ($24,500) with +12% badge. Below it, a horizontal swiper of 'Quick Actions' (Send, Recieve), followed by 'Recent Transactions' list.
- Screen 2: "Market": A vertical list of crypto assets. Each row has a logo, name, sparkline graph, and price. 
- Screen 3: "Trade Modal": A clean input form with big numbers, 'Slide to Confirm' button.

OUTPUT SCHEMA (JSON):
{{
  "totalScreens": number,
  "screenPrompts": [
    {{ 
      "id": "uuid",
      "title": "Short Title", 
      "prompt": "Detailed visual spec: layout, specific components, data examples, interaction patterns...", 
      "order": number 
    }}
  ]
}}
`
);

// ---------------------------------------------------------------------------
// 5. UPDATE TEMPLATE
// ---------------------------------------------------------------------------
export const updateTemplate = PromptTemplate.fromTemplate(
  `You are a Senior Frontend Engineer. 
The user wants to update an existing screen.

Request: "{message}"
System Context: 
{colorPaletteInstructions}

Current Screen Context:
{previousScreensContext}

INSTRUCTIONS:
1. Apply the user's requested change exactly.
2. Maintain the existing "Gold Standard" design system (rounded-3xl, p-5, proper spacing).
3. Keep the outer layout shell (w-full min-h-screen flex flex-col).
4. If the user asks for a new component, steal from the COMPONENT REFERENCE below:
` + COMPONENT_PATTERNS + `

Output Single JSON:
{{ "html": "...", "title": "...", "description": "..." }}
`
);

export const designSystemInstructions = GOLD_STANDARD_AESTHETIC;
