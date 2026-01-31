import React, { useState, useCallback, useRef, useEffect } from "react";
// import { type Theme } from "@/types";
import { X, Search, Upload, Loader2, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  useSearchUnsplashPhotos,
  useRandomUnsplashPhotos,
  useListMedia,
  useUploadMedia,
  useTrackUnsplashDownload,
} from "@/hooks/use-images";
import type { UnsplashPhoto, MediaItem } from "@/services/images";
import { useEditorTheme } from "..";

export interface SelectedImage {
  imageUrl: string;
  alt?: string;
  attribution?: {
    name: string;
    link: string;
  };
}

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: SelectedImage) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const theme = useEditorTheme();
  const isDark = theme.themeType === "dark";
  const [activeTab, setActiveTab] = useState<"unsplash" | "uploads">("unsplash");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Unsplash queries - only enabled when modal is open
  const { data: searchResults, isLoading: isSearching } = useSearchUnsplashPhotos(
    { query: debouncedQuery, perPage: 30 },
    isOpen && activeTab === "unsplash" && debouncedQuery.length > 0
  );
  
  const { data: randomPhotos, isLoading: isLoadingRandom } = useRandomUnsplashPhotos(
    { count: 30 },
    isOpen && activeTab === "unsplash" && debouncedQuery.length === 0
  );

  // User uploads query - only enabled when modal is open
  const { data: userMedia, isLoading: isLoadingMedia } = useListMedia(
    { perPage: 50 },
    isOpen // Only fetch when modal is open
  );

  // Mutations
  const uploadMedia = useUploadMedia();
  const trackDownload = useTrackUnsplashDownload();

  const unsplashPhotos = debouncedQuery 
    ? (searchResults?.data?.results || []) 
    : (Array.isArray(randomPhotos?.data) ? randomPhotos.data : []);
  const userPhotos = userMedia?.data?.list || [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const result = await uploadMedia.mutateAsync({
        file,
        name: file.name,
      });
      
      if (result?.data) {
        onSelect({
          imageUrl: result.data.imageUrl,
          alt: file.name,
        });
        onClose();
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsProcessing(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onSelect, onClose, uploadMedia]);

  const handleSelectUnsplashPhoto = useCallback(async (photo: UnsplashPhoto) => {
    try {
      setIsProcessing(true);
      await trackDownload.mutateAsync({ downloadLocation: photo.links.downloadLocation });
    } catch (error) {
      console.error("Failed to track download:", error);
    }

    onSelect({
      imageUrl: photo.urls.regular,
      alt: photo.altDescription || "",
      attribution: {
        name: photo.user.name,
        link: `https://unsplash.com/@${photo.user.username}?utm_source=butterfast&utm_medium=referral`,
      },
    });
    setIsProcessing(false);
    onClose();
  }, [onSelect, onClose, trackDownload]);

  const handleSelectUserMedia = useCallback((media: MediaItem) => {
    onSelect({
      imageUrl: media.imageUrl,
      alt: media.name,
    });
    onClose();
  }, [onSelect, onClose]);

  const actualLoading = isSearching || isLoadingRandom || isLoadingMedia;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="p-0 overflow-hidden border-0"
        style={{
          backgroundColor: isDark 
            ? "rgba(25, 25, 30, 0.95)" 
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          boxShadow: isDark
            ? "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset"
            : "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset",
          maxWidth: "540px",
          width: "95vw",
          height: "80vh",
          maxHeight: "80vh",
        }}
      >
        {/* Processing Overlay */}
        {isProcessing && (
          <div 
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-3 backdrop-blur-md"
            style={{ backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
          >
            <div className="p-4 rounded-2xl bg-white/10 dark:bg-black/20 shadow-xl border border-white/10 flex flex-col items-center">
              <Loader2 size={32} className="animate-spin text-primary" />
              <span className="text-xs font-medium mt-3" style={{ color: isDark ? "#fff" : "#000" }}>
                Processing Image...
              </span>
            </div>
          </div>
        )}

        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)",
          }}
        />

        <div className="relative flex flex-col h-full overflow-hidden">
          <div 
            className="relative flex items-center justify-between px-5 py-4 border-b shrink-0"
            style={{ 
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            }}
          >
            <h3 
              className="text-base font-semibold"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              Choose Image
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                color: isDark ? "#fff" : "#000",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div 
            className="relative px-5 py-3 border-b shrink-0"
            style={{ 
              borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            }}
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "unsplash" | "uploads")}>
              <TabsList 
                className="w-full p-1 rounded-lg"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                }}
              >
                <TabsTrigger 
                  value="unsplash" 
                  className="flex-1 text-xs font-medium data-[state=active]:shadow-sm"
                  style={{
                    color: activeTab === "unsplash" ? theme.primary : (isDark ? "#999" : "#666"),
                    backgroundColor: activeTab === "unsplash" 
                      ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") 
                      : "transparent",
                  }}
                >
                  Unsplash
                </TabsTrigger>
                <TabsTrigger 
                  value="uploads" 
                  className="flex-1 text-xs font-medium data-[state=active]:shadow-sm"
                  style={{
                    color: activeTab === "uploads" ? theme.primary : (isDark ? "#999" : "#666"),
                    backgroundColor: activeTab === "uploads" 
                      ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") 
                      : "transparent",
                  }}
                >
                  My Uploads
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "uploads" && (
              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMedia.isPending || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: `${theme.primary}15`,
                    color: theme.primary,
                  }}
                >
                  {uploadMedia.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {uploadMedia.isPending ? "Uploading..." : "Upload Image"}
                </button>
              </div>
            )}

            {activeTab === "unsplash" && (
              <div className="mt-3 relative">
                <Search 
                  size={14} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                  style={{ color: isDark ? "#fff" : "#000" }}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search photos..."
                  className="pl-9 h-9 text-xs border-0 outline-none focus-visible:ring-0"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    color: isDark ? "#fff" : "#000",
                  }}
                />
                {(isSearching || (searchQuery !== debouncedQuery && searchQuery.length > 0)) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={12} className="animate-spin opacity-40" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div 
            className="relative flex-1 overflow-y-auto px-5 py-4"
          >
            {actualLoading && unsplashPhotos.length === 0 && userPhotos.length === 0 && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square rounded-lg animate-pulse"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                  />
                ))}
              </div>
            )}

            {activeTab === "unsplash" && !actualLoading && (
              <>
                {unsplashPhotos.length === 0 && debouncedQuery ? (
                  <div className="flex items-center justify-center py-12">
                    <span 
                      className="text-xs opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      No images found for &quot;{debouncedQuery}&quot;
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {unsplashPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        disabled={isProcessing}
                        onClick={() => handleSelectUnsplashPhoto(photo)}
                        className="relative aspect-square rounded-lg overflow-hidden group transition-all"
                      >
                        <img
                          src={photo.urls.small}
                          alt={photo.altDescription || "Unsplash photo"}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                          }}
                        >
                          <span className="text-white text-[9px] truncate">
                            {photo.user.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "uploads" && !actualLoading && (
              <>
                {userPhotos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Upload 
                      size={32} 
                      className="opacity-20"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                    <span 
                      className="text-xs opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      No uploads yet
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {userPhotos.map((media) => (
                      <button
                        key={media.id}
                        disabled={isProcessing}
                        onClick={() => handleSelectUserMedia(media)}
                        className="relative aspect-square rounded-lg overflow-hidden group transition-all"
                      >
                        <img
                          src={media.imageUrl}
                          alt={media.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        {media.isFavorite && (
                          <div className="absolute top-1.5 right-1.5">
                            <Heart 
                              size={12} 
                              className="text-red-500 fill-red-500"
                            />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {activeTab === "unsplash" && (
            <div 
              className="relative px-5 py-3 text-center border-t shrink-0"
              style={{ 
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              }}
            >
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] opacity-40 hover:opacity-70 transition-opacity"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                Photos provided by Unsplash
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

