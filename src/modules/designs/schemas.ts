import { z } from 'zod';

// ==========================
// Zod Schemas
// ==========================

export const ColorPaletteSchema = z.object({
  primary: z.string().describe('Primary brand color (hex code)'),
  primaryLight: z.string().describe('Light variant of primary color'),
  primaryDark: z.string().describe('Dark variant of primary color'),
  secondary: z.string().describe('Secondary brand color (hex code)'),
  accent: z.string().describe('Accent color for highlights and CTAs'),
  background: z.string().describe('Main background color'),
  backgroundSecondary: z.string().describe('Secondary background color'),
  surface: z.string().describe('Surface color for cards and containers'),
  surfaceSecondary: z.string().describe('Secondary surface color'),
  textPrimary: z.string().describe('Primary text color'),
  textSecondary: z.string().describe('Secondary text color'),
  textMuted: z.string().describe('Muted text color'),
  border: z.string().describe('Border color'),
  borderLight: z.string().describe('Light border color'),
  success: z.string().describe('Success state color'),
  warning: z.string().describe('Warning state color'),
  error: z.string().describe('Error state color'),
  info: z.string().describe('Info state color'),
});

export const ScreenPlanSchema = z.object({
  totalScreens: z
    .number()
    .min(1)
    .max(8)
    .describe('Total number of screens needed'),
  screenPrompts: z
    .array(
      z.object({
        title: z.string().describe('Screen title'),
        prompt: z
          .string()
          .describe('Detailed prompt for generating this specific screen'),
        order: z.number().describe('Order of screen generation'),
      }),
    )
    .describe('Individual prompts for each screen'),
});

export const SingleScreenSchema = z.object({
  title: z.string().describe('A concise title for the mobile screen'),
  description: z
    .string()
    .describe("A brief description of the screen's purpose and functionality"),
  html: z.string().describe('Complete HTML code for the mobile screen'),
});

export const IntentSchema = z.object({
  intent: z
    .enum(['create_new', 'update_existing', 'delete_existing'])
    .describe(
      'Whether to create new screens, update existing ones, or delete existing ones',
    ),
  reasoning: z
    .string()
    .describe('Brief explanation of why this intent was chosen'),
  screensToUpdate: z
    .array(
      z.object({
        id: z
          .string()
          .describe('Database ID of the screen to update or delete'),
        title: z.string().describe('Title of the screen for reference'),
      }),
    )
    .nullable()
    .describe(
      'Array of screens to update/delete with their IDs and titles (only for update_existing/delete_existing intent, null for create_new)',
    ),
});

export const StreamUpdateSchema = z.object({
  type: z.enum([
    'intent_analysis',
    'ai_thinking',
    'status_update',
    'thinking_step',
    'tool_use',
    'planning',
    'planning_complete',
    'screen_start',
    'screen_complete',
    'screen_update',
    'screen_delete',
    'screen_error',
    'agent_step',
    'all_complete',
  ]),
  data: z.any().optional(),
  progress: z
    .object({
      current: z.number(),
      total: z.number(),
    })
    .optional(),
});

// ==========================
// TypeScript Types
// ==========================

export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
export type ScreenPlan = z.infer<typeof ScreenPlanSchema>;
export type SingleScreen = z.infer<typeof SingleScreenSchema>;
export type Intent = z.infer<typeof IntentSchema>;
export type StreamUpdate = z.infer<typeof StreamUpdateSchema>;

// ==========================
// Database Types
// ==========================

export interface ExistingScreen {
  id: string;
  title: string;
  description: string | null;
  html: string;
}

export interface ConversationData {
  id: string;
  title: string;
  colorPalette?: ColorPalette | null;
}

export interface MessageData {
  role: 'user' | 'assistant';
  content: string;
}

export interface ScreenPromptData {
  title: string;
  prompt: string;
}

export interface ScreenToUpdate {
  id: string;
  title: string;
  description: string;
  html: string;
}
