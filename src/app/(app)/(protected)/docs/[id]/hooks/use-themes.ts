import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTheme,
  getThemes,
  getAdminThemes,
  getTheme,
  updateTheme,
  deleteTheme,
  type ThemeResponse,
} from "@/services/themes";
import type { Theme } from "@/store/slices/cardsSlice";

// Types for hook params/payloads
export interface ListThemesParams {
  includeAdmin?: boolean;
  includeUser?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateThemePayload {
  name: string;
  description?: string;
  themeData: Theme;
  isAdmin?: boolean;
}

export interface UpdateThemePayload {
  name?: string;
  description?: string;
  themeData?: Partial<Theme>;
}

// Query keys
export const themeKeys = {
  all: ["themes"] as const,
  lists: () => [...themeKeys.all, "list"] as const,
  list: (params?: ListThemesParams) => [...themeKeys.lists(), params] as const,
  admin: {
    all: () => [...themeKeys.all, "admin"] as const,
    lists: () => [...themeKeys.admin.all(), "list"] as const,
    list: (params?: Omit<ListThemesParams, "includeAdmin" | "includeUser">) =>
      [...themeKeys.admin.lists(), params] as const,
  },
  detail: (id: string) => [...themeKeys.all, "detail", id] as const,
};

/**
 * List themes query
 */
export const useThemesList = (params?: ListThemesParams) => {
  return useQuery({
    queryKey: themeKeys.list(params),
    queryFn: async () => {
      try {
        return await getThemes(params);
      } catch (error: any) {
        throw new Error(
          error.message || "Failed to load themes. Please try again."
        );
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * List admin themes query (no authentication required for reading)
 */
export const useAdminThemesList = (
  params?: Omit<ListThemesParams, "includeAdmin" | "includeUser">
) => {
  return useQuery({
    queryKey: themeKeys.admin.list(params),
    queryFn: async () => {
      try {
        return await getAdminThemes();
      } catch (error: any) {
        throw new Error(
          error.message || "Failed to load admin themes. Please try again."
        );
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};





