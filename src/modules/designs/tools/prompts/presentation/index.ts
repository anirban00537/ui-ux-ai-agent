import { PromptTemplate } from '@langchain/core/prompts';

export const designSystemInstructions = `
DESIGN SYSTEM & IMPLEMENTATION GUIDELINES (STRICT):

1. LAYOUT & SPACING (16:9 Slide Format):
   - The output will be rendered in a 16:9 container.
   - Use strict 8pt grid.
   - Use 'flex' and 'grid' for layouts.
   - Ensure content is centered or balanced.

2. TYPOGRAPHY (Presentation Readable):
   - Font Family: Use sans-serif default (Inter-like) or Serif for headings if requested.
   - Hierarchy:
     * H1 (Title): text-4xl or text-5xl, font-bold.
     * H2 (Slide Heading): text-3xl, font-semibold.
     * Body: text-xl or text-2xl (Must be readable from distance).
     * Caption: text-base.
   - Keep text concise. Bullet points are preferred over paragraphs.

3. COLORS & CONTRAST:
   - High contrast is essential for projection/presentation.
   - Use the provided palette.

4. VISUAL FLOURISHES:
   - Use high-quality images (Unsplash).
   - Use icons (RemixIcon) to support text.
   - Clean, uncluttered layouts.

5. CONTENT GENERATION:
   - Write professional, engaging content suitable for a presentation.
   - "Lorem Ipsum" is forbidden.

IMAGERY POLICY (STRICT):
- Use Unsplash URLs: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80 (High Res for slides)
- Select high-quality, relevant IDs.
- NEVER use placeholders.

CONTAINER:
- The output HTML will be rendered in a container that simulates a slide.
- Use w-full h-full to fill the slide.
`;

export const generationTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a World-Class Presentation Designer (Top 1% on Pitch/Canva). You build stunning, effective presentation slides using TailwindCSS.

USER REQUEST: "{message}"

{colorPaletteInstructions}

` + designSystemInstructions + `

SPECIFIC INSTRUCTIONS FOR THIS SLIDE:
- Title: {title}
- Description: {description}
- Prompt: {prompt}

OUTPUT FORMAT (STRICT):
- Return a Single JSON object: {{ html, title, description }}
- HTML must be a full <div>...</div> structure (using Tailwind classes) that represents the SLIDE CONTENT.
- DO NOT return markdown, code blocks, or explanations. Just the JSON.
- Ensure the HTML is valid and self-contained.

YOUR GOAL:
Create a visually impactful slide that conveys the message clearly. Focus on hierarchy, balance, and visual appeal.
`
);

export const planningTemplate = PromptTemplate.fromTemplate(
  `ROLE: You are a Presentation Strategist.

USER REQUEST: "{message}"

YOUR TASK:
Plan a deck of slides (3 to 8) to fulfill the user's request.

GUIDELINES:
1. **Be Specific**: "Title Slide - [Topic]", "Problem Statement", "Solution", "Market Analysis", "Team", "Conclusion".
2. **Flow**: Ensure a logical narrative arc.
3. **Detail**: For each slide, write a "prompt" that a designer (AI) can use to build it. Mention layout (e.g., "Split screen", "Full image background", "Grid of 3 points").

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
  `ROLE: You are a Presentation Designer updating an existing slide.

{colorPaletteInstructions}

` + designSystemInstructions + `

OUTPUT FORMAT (STRICT):
- Return a Single JSON object: {{ html, title, description }}
- HTML must be a full <div>...</div> structure (using Tailwind classes).
- DO NOT return markdown, code blocks, or explanations. Just the JSON.

PRESERVATION-FIRST UPDATE PHILOSOPHY:
1. PRESERVE CORE STRUCTURE (Unless explicitly asked to change).
2. TARGETED IMPROVEMENTS.
3. PROFESSIONAL UPDATE STANDARDS (Readable, Aligned, Consistent).
`
);
