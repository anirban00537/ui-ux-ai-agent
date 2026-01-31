// ==========================
// TypeScript Types (Pure TypeScript - No Zod)
// ==========================

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ScreenPromptItem {
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
    | 'screen_complete'
    | 'screen_update'
    | 'screen_delete'
    | 'screen_error'
    | 'agent_step'
    | 'all_complete';
  data?: any;
  progress?: {
    current: number;
    total: number;
  };
}

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
