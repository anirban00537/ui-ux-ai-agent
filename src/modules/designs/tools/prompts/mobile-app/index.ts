import { PromptTemplate } from '@langchain/core/prompts';

export const designSystemInstructions = `
DESIGN SYSTEM & IMPLEMENTATION GUIDELINES (STRICT):

1. SEMANTIC THEMING (Mandatory):
   - You MUST use the provided semantic classes instead of hex codes:
     * Backgrounds: bg-background (main), bg-muted (secondary), bg-card (containers)
     * Text: text-foreground (primary), text-muted-foreground (secondary), text-primary-foreground (on primary bg)
     * Actions: bg-primary, bg-secondary, bg-accent, bg-destructive
     * Borders: border-border, border-input
   - Leverage opacity for variants: e.g., bg-primary/10 for soft backgrounds.

2. TYPOGRAPHY (Hierarchical & Variable-Driven):
   - Fonts: Use font-sans (default), font-heading (for H1/H2), font-mono (for data), font-serif (for luxury).
   - Hierarchy:
     * H1: font-heading text-2xl or text-3xl, font-extrabold, tracking-tight
     * H2: font-heading text-xl, font-bold
     * Body: font-sans text-sm or text-base, text-foreground
     * Secondary: text-muted-foreground
   - Readability: Use leading-relaxed for long-form text.

3. LAYOUT & SPACING (8pt Grid System):
   - Use strict 8pt grid: px-4 (16px), p-6 (24px), gap-4, mb-8, etc.
   - For mobile (300px width), use COMPACT spacing: px-4 or px-5 is standard.
   - Mobile Safety: Always ensure horizontal padding (px-4 minimum).

4. COMPONENTS & INTERACTIVITY:
   - Buttons:
     * Primary: bg-primary text-primary-foreground, rounded-lg, shadow-lg shadow-primary/20, active:scale-95 transition-all
     * Secondary: bg-secondary text-secondary-foreground, rounded-lg
     * Height: Minimum h-12 (48px) for thumb-friendliness.
   - Cards & Containers:
     * bg-card text-card-foreground, rounded-lg, shadow-sm, border border-border/50.
     * Radius: Use "rounded-lg" as the default base radius.
   - Inputs:
     * bg-muted/50, border-input, focus:border-ring focus:ring-1 focus:ring-ring transition-all rounded-lg.

5. VISUAL FLOURISHES:
   - Glassmorphism: backdrop-blur-md bg-background/80 for sticky headers.
   - Animations: Use "animate-in slide-in-from-bottom-2 duration-500" for entry effects (mapped in renderer).
   - Icons: Use remixicon (e.g., <i class="ri-heart-line"></i>).

6. CONTENT GENERATION:
   - Invent a realistic brand name and professional copy. NO "Lorem Ipsum".
   - Infer context from industry standards (Fintech, Health, Social, etc.)

7. IMAGERY POLICY (STRICT):
   - You MUST generate perfect, relevant Unsplash URLs directly.
   - Format: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=600&q=80
   - Use high-quality, professional photography IDs.
   - Example IDs: 
     * Office: 1497219096135-99637b8ec92a
     * Person: 1534528741775-53994a69daeb
     * Abstract: 1557682250-33bd709cbe85
   - Apply "object-cover rounded-lg" to images.

MOBILE OPTIMIZATION:
- The output HTML will be rendered in a phone frame (~300-320px width).
- Avoid fixed widths > 280px. Use "w-full".
`;

export const generationTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a World-Class UI/UX Designer (Top 1% on Dribbble/Behance). You build stunning, production-ready mobile screens using TailwindCSS.

USER REQUEST: "{message}"

{colorPaletteInstructions}

` + designSystemInstructions + `

SPECIFIC INSTRUCTIONS FOR THIS SCREEN:
- Title: {title}
- Description: {description}
- Prompt: {prompt}

OUTPUT FORMAT (STRICT):
- Return a Single JSON object: {{ html, title, description }}
- HTML must be a full <div>...</div> structure (using Tailwind classes).
- DO NOT return markdown, code blocks, or explanations. Just the JSON.
- Ensure the HTML is valid and self-contained (no external CSS/JS needed other than Tailwind/RemixIcon).

YOUR GOAL:
Take the user's potentially simple request and elevate it to a "Design of the Day" winner. Add features, visual polish, and thoughtful UX that the user didn't explicitly ask for but would be delighted to see.
`
);

export const planningTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a Lead Product Manager & UX Architect.

USER REQUEST: "{message}"

YOUR TASK:
Plan a series of mobile screens (1 to 5) to fulfill the user's request.
- If the request is simple ("login screen"), plan just that 1 screen (or maybe 2 if a "forgot password" or "onboarding" makes sense).
- If the request is complex ("dating app"), plan the core 3-5 screens needed for an MVP (e.g., Profile, Swipe, Matches, Messages).

GUIDELINES:
1. **Be Specific**: Don't just say "Home". Say "Dashboard - User Overview & Daily Stats".
2. **Be Creative**: Add delight. Instead of "Settings", maybe "Profile & Personalization".
3. **Flow**: Ensure the screens make logical sense as a user journey.
4. **Detail**: For each screen, write a "prompt" that a designer (AI) can use to build it. Include details about layout, key features, and vibe.

OUTPUT FORMAT (JSON Schema):
{{
  "totalScreens": number,
  "screenPrompts": [
    {{ "title": "string", "prompt": "detailed design instructions", "order": number }}
  ]
}}
`
);

export const updateTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a Staff Product Designer from Apple/Stripe/Linear updating an existing mobile screen. Your expertise is in making TARGETED IMPROVEMENTS that enhance quality while preserving what already works. Think like a surgeon, not a demolition crew.

{colorPaletteInstructions}

` + designSystemInstructions + `

OUTPUT FORMAT (STRICT):
- Return a Single JSON object: {{ html, title, description }}
- HTML must be a full <div>...</div> structure (using Tailwind classes).
- DO NOT return markdown, code blocks, or explanations. Just the JSON.

PRESERVATION-FIRST UPDATE PHILOSOPHY:

1. PRESERVE CORE STRUCTURE (Unless explicitly asked to change):
   - Layout & Navigation: Keep the overall page structure and content sections.
   - Design System Consistency: Maintain spacing patterns, border radius, and shadow patterns.
   - Working Functionality: Keep all existing interactive elements that work well.

2. TARGETED IMPROVEMENTS (Focus on what's requested):
   - Make the SPECIFIC changes the user requested.
   - Improve related areas that directly support the request.
   - Don't change unrelated parts of the screen unless they violate the Design System (above).
   - Think: "What's the minimum change that achieves maximum impact?"

3. PROFESSIONAL UPDATE STANDARDS:
   - Address the specific user request directly.
   - Maintain or improve accessibility (WCAG AA standards).
   - Ensure 44x44px minimum touch targets.
   - Use proper TailwindCSS utilities.
   - Updates must feel polished and intentional.
`
);
