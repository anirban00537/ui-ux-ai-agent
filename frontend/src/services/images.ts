import { api } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export interface UnsplashPhotoUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  optimized: string;
}

export interface UnsplashPhotoLinks {
  self: string;
  html: string;
  download: string;
  downloadLocation: string;
}

export interface UnsplashPhotoUser {
  id: string;
  username: string;
  name: string;
  profileImage: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  description: string | null;
  altDescription: string | null;
  urls: UnsplashPhotoUrls;
  links: UnsplashPhotoLinks;
  user: UnsplashPhotoUser;
  createdAt: string;
  likes: number;
}

export interface SearchPhotosParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: "landscape" | "portrait" | "squarish";
  color?: string;
  orderBy?: "relevant" | "latest";
}

export interface SearchPhotosResponse {
  total: number;
  results: UnsplashPhoto[];
  page: number;
  perPage: number;
}

export interface GetRandomPhotosParams {
  query?: string;
  username?: string;
  featured?: boolean;
  collectionIds?: string[];
  topicIds?: string[];
  count?: number;
}

export interface TrackDownloadPayload {
  downloadLocation: string;
}

// Media Management Types
export interface MediaItem {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadMediaParams {
  file: File;
  name?: string;
  tags?: string[];
}

export interface ListMediaParams {
  page?: number;
  perPage?: number;
  search?: string;
  category?: "all" | "recent" | "favorites";
  mimeType?: string;
}

export type ListMediaResponse = PaginatedResponse<MediaItem>;

export interface UpdateMediaParams {
  name?: string;
  tags?: string[];
  isFavorite?: boolean;
}

/**
 * Search Unsplash photos
 */
export const searchUnsplashPhotos = (params: SearchPhotosParams) => 
  api.get<SearchPhotosResponse>("/images/unsplash-search", { params });

const simpleSearchCache = new Map<string, string | null>();
const pendingSimpleSearches = new Map<string, Promise<string | null>>();

/**
 * Simple Unsplash search that returns just the optimized URL
 * Used for lazy image loading during card rendering
 */
export const searchUnsplashSimple = async (
  query: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<string | null> => {
  if (!query || query.trim() === "") return null;
  
  const cacheKey = `${query.trim()}:${orientation}`;
  
  // Return from cache if available
  if (simpleSearchCache.has(cacheKey)) {
    return simpleSearchCache.get(cacheKey) || null;
  }
  
  // Return pending promise if already fetching
  if (pendingSimpleSearches.has(cacheKey)) {
    return pendingSimpleSearches.get(cacheKey) || null;
  }

  const fetchPromise = (async () => {
    try {
      const response = await api.get<string>("/images/unsplash-simple", {
        params: { query, orientation },
      });
      const url = (response as unknown as string) || null;
      simpleSearchCache.set(cacheKey, url);
      return url;
    } catch (error) {
      console.error("Failed to fetch Unsplash image:", error);
      return null;
    } finally {
      pendingSimpleSearches.delete(cacheKey);
    }
  })();

  pendingSimpleSearches.set(cacheKey, fetchPromise);
  return fetchPromise;
};

/**
 * Get random Unsplash photos
 */
export const getRandomUnsplashPhotos = (params?: GetRandomPhotosParams) => 
  api.get<UnsplashPhoto | UnsplashPhoto[]>("/images/unsplash-random", { params });

/**
 * Get a specific Unsplash photo by ID
 */
export const getUnsplashPhoto = (photoId: string) => 
  api.get<UnsplashPhoto>(`/images/unsplash/${photoId}/get`);

/**
 * Track Unsplash photo download
 */
export const trackUnsplashDownload = (payload: TrackDownloadPayload) => 
  api.post<void>("/images/unsplash/track-download", payload);

/**
 * Upload media file
 */
export const uploadMedia = (params: UploadMediaParams) => {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.name) formData.append("name", params.name);
  if (params.tags?.length) {
    params.tags.forEach(tag => formData.append("tags", tag));
  }

  return api.post<MediaItem>("/images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * List user's media
 */
export const listMedia = (params?: ListMediaParams) => 
  api.get<ListMediaResponse>("/images", { params });

/**
 * Get single media item
 */
export const getMedia = (id: string) => 
  api.get<MediaItem>(`/images/${id}`);

/**
 * Update media
 */
export const updateMedia = (id: string, params: UpdateMediaParams) => 
  api.put<MediaItem>(`/images/${id}`, params);

/**
 * Delete media
 */
export const deleteMedia = (id: string) => 
  api.delete<void>(`/images/${id}`);
