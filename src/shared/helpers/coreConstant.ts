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
    OUTLINE: {
      NAME: 'x-ai/grok-4.1-fast',
      PRICING: { prompt: 0.2, completion: 0.5 },
    },
    CARDS: {
      NAME: 'meta-llama/llama-4-scout',
      PRICING: { prompt: 0.08, completion: 0.30 },

    },
    IMAGE: {
      NAME: 'black-forest-labs/flux-1.1-pro',
      COST_PER_IMAGE: 0.04, // Actual USD cost
    },
    DEFAULT: {
      PRICING: { prompt: 10.0, completion: 30.0 },
    },
    DESIGN: {
      NAME: 'minimax/minimax-m2.1',
      PRICING: { prompt: 0.27, completion: 1.10 },
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
    FREE_TIER: 15,
    DEFAULT_NEW_USER: 100,
  } as const,
};
