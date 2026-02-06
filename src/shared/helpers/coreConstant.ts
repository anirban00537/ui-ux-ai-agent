export const coreConstant = {
  USER_ROLE_ADMIN: 1,
  USER_ROLE_USER: 2,
  COMMON_PASSWORD: 'r4abbit5onthe4moo333456300^33%%%%%',
  STATUS_INACTIVE: 0,
  STATUS_ACTIVE: 1,
  STATUS_PENDING: 2,
  IS_VERIFIED: 1,
  IS_NOT_VERIFIED: 0,
  VERIFICATION_TYPE_EMAIL: 1,
  FILE_DESTINATION: 'public/uploads',
  MAX_IMAGE_SIZE: 500 * 1024 * 1024, // 500MB

  NOTE_TYPE: {
    PDF: 'pdf',
    YOUTUBE: 'youtube',
    AUDIO: 'audio',
  },
  MIME_TYPE: {
    YOUTUBE: 'video/youtube',
    PDF: 'application/pdf',
    AUDIO_MP3: 'audio/mpeg',
    AUDIO_WAV: 'audio/wav',
  },
  DEFAULT_TAGS: {
    PDF: ['pdf', 'auto-generated'],
    YOUTUBE: ['youtube', 'auto-generated'],
    AUDIO: ['audio', 'auto-generated'],
    AUTO_GENERATED: 'auto-generated',
  },
  DIFFICULTY: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
  },
  STREAM_EVENT: {
    CHAT: 'chat',
    SCREEN_GENERATE: 'screen_generate',
    INTENT_ANALYSIS: 'intent_analysis',
    AI_THINKING: 'ai_thinking',
    STATUS_UPDATE: 'status_update',
    THINKING_STEP: 'thinking_step',
    TOOL_USE: 'tool_use',
    PLANNING: 'planning',
    PLANNING_COMPLETE: 'planning_complete',
    SCREEN_START: 'screen_start',
    SCREEN_STREAMING: 'screen_streaming',
    SCREEN_COMPLETE: 'screen_complete',
    SCREEN_UPDATE: 'screen_update',
    SCREEN_DELETE: 'screen_delete',
    SCREEN_ERROR: 'screen_error',
    COLOR_PALETTE: 'color_palette',
    AGENT_STEP: 'agent_step',
    ALL_COMPLETE: 'all_complete',
    // Clean phase events for UI status badges
    PHASE_ANALYZING: 'phase_analyzing',
    PHASE_ANALYZED: 'phase_analyzed',
    PHASE_PLANNING: 'phase_planning',
    PHASE_PLANNED: 'phase_planned',
    PHASE_THEME_GENERATING: 'phase_theme_generating',
    PHASE_THEME_COMPLETE: 'phase_theme_complete',
    // Backend-driven step (label + status); persisted as message for DB load
    PHASE_STEP: 'phase_step',
    // AI response message (persisted to chat)
    AI_RESPONSE: 'ai_response',
  } as const,

  // Post Status
  POST_STATUS: {
    DRAFT: 0,
    SCHEDULED: 1,
    PUBLISHED: 2,
    FAILED: 3,
  },

  VERIFICATION: {
    VERIFIED: 1,
    NOT_VERIFIED: 0,
  },

  /** Max number of previous screens/slides passed as context for design-pattern consistency (if available). */
  DESIGN_CONTEXT: {
    MAX_PREVIOUS_SCREENS: 3,
  } as const,

  AI_MODELS: {
    DESIGN: {
      NAME: 'deepseek/deepseek-v3.2',
      PRICING: { prompt: 1, completion: 2 },
      PROVIDER: {
        ENABLED: true,
        ORDER: ['deepinfra/fp4', 'deepinfra/fp8'] as any,
        ALLOW_FALLBACKS: true,
      },
    },
    AGENT: {
      NAME: 'google/gemini-3-flash-preview',
      PRICING: { prompt: 1, completion: 2 },
      PROVIDER: {
        ENABLED: false,
        ORDER: ['together', 'deepinfra/fp8'] as any,
        ALLOW_FALLBACKS: true,
      },
    },
  },

  // Subscription Status Constants
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    TRIALING: 'trialing',
    INACTIVE: 'inactive',
    CANCELED: 'canceled',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    PAST_DUE: 'past_due',
    REFUNDED: 'refunded',
    CANCELLING: 'cancelling',
  } as const,

  // Statuses that grant active access
  SUBSCRIPTION_ACTIVE_STATUSES: ['active', 'trialing'] as const,

  // Statuses that indicate subscription has ended
  SUBSCRIPTION_ENDED_STATUSES: ['canceled', 'expired', 'revoked'] as const,

  // Credit System Constants
  CREDITS: {
    FREE_TIER: 0,
    DEFAULT_NEW_USER: 250,
  } as const,

  // Pricing Plans
  PRICING_PLANS: {
    STARTER: {
      NAME: 'Starter',
      PRICE: 10,
      CREDITS: 7000,
      FEATURES: [
        '7,000 Credits (~140 Screens)',
        'Unlimited Projects',
        'Basic Export (HTML + Tailwind)',
        'Standard Speed',
        'Community Support',
      ],
    },
    PRO: {
      NAME: 'Pro',
      PRICE: 20,
      CREDITS: 15000,
      FEATURES: [
        '15,000 Credits (~300 Screens)',
        'Priority Generation Queue',
        'Advanced Export (React Components)',
        'Design History (Unlimited)',
        'Commercial Usage Rights',
        'Priority Support',
      ],
    },
  },
};
