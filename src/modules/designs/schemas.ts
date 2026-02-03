// ==========================
// TypeScript Types (Pure TypeScript - No Zod)
// ==========================

export interface ColorPalette {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
}

export interface ScreenPromptItem {
  id?: string;
  title: string;
  prompt: string;
  order: number;
}

export interface ScreenPlan {
  totalScreens: number;
  screenPrompts: ScreenPromptItem[];
}

export interface SingleScreen {
  title: string;
  description: string;
  html: string;
}

export interface Intent {
  intent: 'create_new' | 'update_existing' | 'delete_existing';
  reasoning: string;
  screensToUpdate: Array<{ id: string; title: string }> | null;
}

export interface StreamUpdate {
  type:
    | 'intent_analysis'
    | 'ai_thinking'
    | 'status_update'
    | 'thinking_step'
    | 'tool_use'
    | 'planning'
    | 'planning_complete'
    | 'screen_start'
    | 'screen_streaming'
    | 'screen_complete'
    | 'screen_update'
    | 'screen_delete'
    | 'screen_error'
    | 'color_palette'
    | 'agent_step'
    | 'all_complete'
    // Clean phase events for UI status badges
    | 'phase_analyzing'
    | 'phase_analyzed'
    | 'phase_planning'
    | 'phase_planned'
    | 'phase_theme_generating'
    | 'phase_theme_complete'
    | 'phase_step'
    | 'ai_response';
  data?: any;
  progress?: {
    current: number;
    total: number;
  };
}

// ==========================
// Database Types
// ==========================

export interface ExistingArtboard {
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
  id?: string;
  title: string;
  prompt: string;
}

export interface ArtboardToUpdate {
  id: string;
  title: string;
  description: string;
  html: string;
}

/** Last N screens/slides passed as context for design-pattern consistency (max 3). */
export interface PreviousScreenContext {
  title: string;
  description: string | null;
  html: string;
}
