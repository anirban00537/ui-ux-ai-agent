import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DesignType } from "@/services/designs";

export interface Artboard {
  id: string;
  title: string;
  description?: string;
  html: string;
  createdAt: string;
  status?: "generating" | "complete";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isHeightLocked?: boolean; // When true, user has manually set height - don't auto-resize
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
  type?: "stream" | "final";
  eventType?: string;
  status?: string;
  data?: Record<string, unknown>;
}

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
  fontFamily?: string;
  fontHeading?: string;
  fontBody?: string;
}

export interface Conversation {
  id: string;
  title: string;
  designType: DesignType;
  messages: Message[];
  artboards: Artboard[];
  colorPalette?: ColorPalette;
  isPublic: boolean;
}

interface DesignEditorState {
  conversation: Conversation | null;
  error: string | null;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  selectedArtboardId: string | null;
  copiedArtboardId: string | null;
}

export interface GenerationProgress {
  current: number;
  total: number;
  phase: "analyzing" | "theme_generating" | "analyzed" | "planning" | "generating" | "complete";
  currentScreen?: string;
  screenTitles?: string[];
  steps?: Array<{ label: string; status: "loading" | "completed" }>;
}

const initialState: DesignEditorState = {
  conversation: null,
  error: null,
  isGenerating: false,
  progress: null,
  selectedArtboardId: null,
  copiedArtboardId: null,
};

const designEditorSlice = createSlice({
  name: "designEditor",
  initialState,
  reducers: {
    setConversation: (state, action: PayloadAction<any>) => {
      if (!action.payload) {
        state.conversation = null;
        return;
      }
      
      // Map API response to our Conversation interface
      // The API often returns 'artboards' or 'screens'
      // and might not have 'messages' if not fetched
      state.conversation = {
        id: action.payload.id,
        title: action.payload.title,
        designType: action.payload.type || action.payload.designType || "mobile_app",
        messages: action.payload.messages || [],
        artboards: action.payload.artboards || action.payload.screens || [],
        colorPalette: action.payload.colorPalette,
        isPublic: !!action.payload.isPublic,
      };
    },
    updateConversation: (state, action: PayloadAction<Partial<Conversation>>) => {
      if (state.conversation) {
        state.conversation = { ...state.conversation, ...action.payload };
      }
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      if (state.conversation) {
        state.conversation.messages.push(action.payload);
      }
    },
    prependMessages: (state, action: PayloadAction<Message[]>) => {
      if (state.conversation) {
        // Create a new array with prepended messages, avoiding duplicates by ID
        const existingIds = new Set(state.conversation.messages.map(m => m.id));
        const newMessages = action.payload.filter(m => !existingIds.has(m.id));
        
        state.conversation.messages = [...newMessages, ...state.conversation.messages];
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ id: string; content?: string; status: string; data?: any }>) => {
      if (state.conversation) {
        const msg = state.conversation.messages.find(m => m.id === action.payload.id);
        if (msg) {
          if (action.payload.content !== undefined) msg.content = action.payload.content;
          msg.status = action.payload.status;
          if (action.payload.data) msg.data = { ...msg.data, ...action.payload.data };
        }
      }
    },
    updateArtboard: (state, action: PayloadAction<Partial<Artboard> & { id: string; tempId?: string }>) => {
      if (state.conversation) {
        if (!state.conversation.artboards) state.conversation.artboards = [];
        
        const { tempId, id, title } = action.payload;
        
        // Find by current ID, or the tempId it might be replacing, or title as last resort
        const index = state.conversation.artboards.findIndex(s => 
          s.id === id || 
          (tempId && s.id === tempId) || 
          (title && s.title === title) // Only match by title if title is provided & non-empty
        );

        if (index !== -1) {
          state.conversation.artboards[index] = { ...state.conversation.artboards[index], ...action.payload };
          // If we were replacing a tempId, make sure the new ID is set correctly
          if (tempId && state.conversation.artboards[index].id === tempId) {
            state.conversation.artboards[index].id = id;
          }
        } else {
          // Only push if we have enough info to create a new artboard (at least html/title implied)
          // Since it's Partial, we cast it, but in practice creation usually provides full data.
          state.conversation.artboards.push(action.payload as Artboard);
        }
      }
    },
    removeArtboard: (state, action: PayloadAction<string>) => {
      if (state.conversation) {
        state.conversation.artboards = state.conversation.artboards.filter(s => s.id !== action.payload);
      }
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setProgress: (state, action: PayloadAction<GenerationProgress | null>) => {
      if (action.payload === null) {
        state.progress = null;
      } else if (state.progress) {
        state.progress = { ...state.progress, ...action.payload };
      } else {
        state.progress = action.payload;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setColorPalette: (state, action: PayloadAction<ColorPalette>) => {
      if (state.conversation) {
        state.conversation.colorPalette = action.payload;
      }
    },
    updateColorValue: (state, action: PayloadAction<{ key: keyof ColorPalette; value: string }>) => {
      if (state.conversation?.colorPalette) {
        // Create new object to ensure React detects the change
        state.conversation.colorPalette = {
          ...state.conversation.colorPalette,
          [action.payload.key]: action.payload.value,
        };
      }
    },
    setCopiedId: (state, action: PayloadAction<string | null>) => {
      state.copiedArtboardId = action.payload;
    },
    setSelectedId: (state, action: PayloadAction<string | null>) => {
      state.selectedArtboardId = action.payload;
    },
    resetEditor: () => initialState,
    cancelGeneration: (state) => {
      state.isGenerating = false;
      state.progress = null;
      if (state.conversation?.artboards) {
        state.conversation.artboards.forEach(artboard => {
          if (artboard.status === "generating") {
            artboard.status = "complete"; 
          }
        });
      }
    },
  }
});

export const {
  setConversation,
  updateConversation,
  addMessage,
  prependMessages,
  updateMessageStatus,
  updateArtboard,
  removeArtboard,
  setGenerating,
  setProgress,
  setError,
  setColorPalette,
  updateColorValue,
  setCopiedId,
  setSelectedId,
  resetEditor,
  cancelGeneration
} = designEditorSlice.actions;

export default designEditorSlice.reducer;
