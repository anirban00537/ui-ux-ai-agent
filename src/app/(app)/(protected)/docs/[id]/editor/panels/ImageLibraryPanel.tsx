import React, { useState, useCallback, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { X, Search, Upload, Loader2, Heart, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackEvent } from "@/components/analytics/trackEvent";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSearchUnsplashPhotos,
  useRandomUnsplashPhotos,
  useListMedia,
  useUploadMedia,
  useTrackUnsplashDownload,
} from "@/hooks/use-images";
import type { UnsplashPhoto, MediaItem } from "@/services/images";

// Draggable Image Item Component
interface DraggableImageItemProps {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  alt: string;
  attribution?: { name: string; link: string };
  authorName?: string;
  onClick: () => void;
}

const DraggableImageItem: React.FC<DraggableImageItemProps> = ({
  id,
  imageUrl,
  thumbnailUrl,
  alt,
  attribution,
  authorName,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `image-option-${id}`,
    data: {
      type: "image-option",
      imageUrl,
      imageAlt: alt,
      attribution,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing"
    >
      <img
        src={thumbnailUrl}
        alt={alt}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />
      {/* Hover overlay */}
      {authorName && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
          }}
        >
          <span className="text-white text-[9px] truncate">
            {authorName}
          </span>
        </div>
      )}
    </div>
  );
};

interface ImageLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (imageUrl: string, attribution?: { name: string; link: string }) => void;
}

export const ImageLibraryPanel: React.FC<ImageLibraryPanelProps> = ({
  isOpen,
  onClose,
  onSelectImage,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  
  const [activeTab, setActiveTab] = useState<"unsplash" | "uploads">("unsplash");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UnsplashPhoto | MediaItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Unsplash queries - only enabled when panel is open
  const { data: searchResults, isLoading: isSearching, error: searchError } = useSearchUnsplashPhotos(
    { query: debouncedQuery, perPage: 30 },
    isOpen && activeTab === "unsplash" && debouncedQuery.length > 0 // Only fetch when panel is open
  );
  
  const { data: randomPhotos, isLoading: isLoadingRandom, error: randomError } = useRandomUnsplashPhotos(
    { count: 30 },
    isOpen && activeTab === "unsplash" && debouncedQuery.length === 0 // Only fetch when panel is open
  );

  // User media query - only enabled when panel is open
  const { data: userMedia, isLoading: isLoadingMedia } = useListMedia(
    { perPage: 50 },
    isOpen // Only fetch when panel is open
  );

  // Mutations
  const uploadMutation = useUploadMedia();
  const trackDownload = useTrackUnsplashDownload();

  // Handle search input with debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (value) {
        trackEvent('image_search', 'engagement', value);
      }
      setDebouncedQuery(value);
    }, 500);
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((image: UnsplashPhoto | MediaItem) => {
    const id = 'urls' in image ? image.id : image.id;
    trackEvent('image_preview_click', 'engagement', id);
    setSelectedImage(image);
    setIsModalOpen(true);
  }, []);

  // Handle image use
  const handleUseImage = useCallback(() => {
    if (!selectedImage) return;

    if ('urls' in selectedImage) {
      // Unsplash image
      const unsplashImage = selectedImage as UnsplashPhoto;
      
      trackEvent('image_use_unsplash', 'engagement', unsplashImage.id);
      // Track download for Unsplash attribution
      trackDownload.mutate({ downloadLocation: unsplashImage.links.downloadLocation });
      
      onSelectImage?.(
        unsplashImage.urls.regular,
        { name: unsplashImage.user.name, link: unsplashImage.user.profileImage.medium }
      );
    } else {
      // User uploaded media
      const mediaItem = selectedImage as MediaItem;
      trackEvent('image_use_upload', 'engagement', mediaItem.id);
      onSelectImage?.(mediaItem.imageUrl);
    }

    setIsModalOpen(false);
    setSelectedImage(null);
    onClose();
  }, [selectedImage, onSelectImage, onClose, trackDownload]);

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      trackEvent('image_upload_start', 'engagement', 'editor');
      await uploadMutation.mutateAsync({ file });
      trackEvent('image_upload_success', 'engagement', 'editor');
    } catch (error) {
      trackEvent('image_upload_error', 'engagement', 'editor');
      console.error("Upload failed:", error);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadMutation]);

  // Get photos to display
  const unsplashPhotos = debouncedQuery 
    ? searchResults?.data?.results || []
    : Array.isArray(randomPhotos?.data) ? randomPhotos.data : [];

  const userPhotos = userMedia?.data?.list || [];

  const panelVariants = {
    hidden: { opacity: 0, x: 10, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 10, scale: 0.98 },
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="images-panel"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            transition={{ duration: 0.15 }}
            className="relative z-40"
          >
            <div
              className={cn(
                "relative w-[420px] max-h-[75vh] flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl",
                isDark 
                  ? "bg-[#1a1a1f]/95 border-white/10" 
                  : "bg-white/95 border-black/10"
              )}
            >


              {/* Header */}
              <div className={cn(
                "relative px-4 py-3 flex items-center justify-between shrink-0 border-b",
                isDark ? "border-white/5" : "border-black/5"
              )}>
                <span className={cn(
                  "text-sm font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>
                  Images
                </span>
                <button
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isDark 
                      ? "text-white/40 hover:text-white hover:bg-white/10" 
                      : "text-black/40 hover:text-black hover:bg-black/5"
                  )}
                  onClick={onClose}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="relative px-4 py-3">
                <Tabs 
                  value={activeTab} 
                  onValueChange={(v) => {
                    trackEvent('image_tab_switch', 'engagement', v);
                    setActiveTab(v as "unsplash" | "uploads");
                  }}
                  className="w-full"
                >
                  <TabsList className={cn(
                    "w-full grid grid-cols-2 h-10 p-1 rounded-xl",
                    isDark ? "bg-white/5" : "bg-black/5"
                  )}>
                    <TabsTrigger 
                      value="unsplash"
                      className={cn(
                        "text-xs font-medium rounded-lg transition-all duration-200",
                        "data-[state=active]:shadow-none",
                        isDark 
                          ? "text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white" 
                          : "text-black/50 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                      )}
                    >
                      Unsplash
                    </TabsTrigger>
                    <TabsTrigger 
                      value="uploads"
                      className={cn(
                        "text-xs font-medium rounded-lg transition-all duration-200",
                        "data-[state=active]:shadow-none",
                        isDark 
                          ? "text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white" 
                          : "text-black/50 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                      )}
                    >
                      My Uploads
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Search Bar (Unsplash only) */}
              {activeTab === "unsplash" && (
                <div className="relative px-4 pb-4">
                  <div className="relative">
                    <Search 
                      size={14} 
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2",
                        isDark ? "text-white/30" : "text-black/30"
                      )}
                    />
                    <Input
                      type="text"
                      placeholder="Search high-quality images..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className={cn(
                        "pl-9 h-10 text-xs border-0 rounded-xl transition-all focus-visible:ring-1 focus-visible:ring-primary/20",
                        isDark 
                          ? "bg-white/5 text-white placeholder:text-white/20" 
                          : "bg-black/5 text-black placeholder:text-black/20"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button (Uploads tab only) */}
              {activeTab === "uploads" && (
                <div className="relative px-4 pb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full h-9 flex items-center justify-center gap-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                      color: theme.primary,
                    }}
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
              )}

              {/* Images Grid */}
              <div 
                className={`relative flex-1 overflow-y-auto px-3 pb-3 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}
              >
                {/* Loading State */}
                {(activeTab === "unsplash" && (isSearching || isLoadingRandom)) && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 
                      size={24} 
                      className="animate-spin opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                  </div>
                )}

                {activeTab === "uploads" && isLoadingMedia && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 
                      size={24} 
                      className="animate-spin opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                  </div>
                )}

                {/* Error State */}
                {(searchError || randomError) && activeTab === "unsplash" && (
                  <div className="flex items-center justify-center py-12">
                    <span 
                      className="text-xs opacity-50"
                      style={{ color: isDark ? "#fff" : "#000" }}
                    >
                      Failed to load images. Please try again.
                    </span>
                  </div>
                )}

                {/* Unsplash Images */}
                {activeTab === "unsplash" && !isSearching && !isLoadingRandom && (
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
                      <div className="grid grid-cols-3 gap-1.5">
                        {unsplashPhotos.map((photo) => (
                          <DraggableImageItem
                            key={photo.id}
                            id={photo.id}
                            imageUrl={photo.urls.regular}
                            thumbnailUrl={photo.urls.small}
                            alt={photo.altDescription || "Unsplash photo"}
                            attribution={{
                              name: photo.user.name,
                              link: `https://unsplash.com/@${photo.user.username}?utm_source=butterfast&utm_medium=referral`,
                            }}
                            authorName={photo.user.name}
                            onClick={() => handleImageSelect(photo)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* User Uploads */}
                {activeTab === "uploads" && !isLoadingMedia && (
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
                      <div className="grid grid-cols-3 gap-1.5">
                        {userPhotos.map((media) => (
                          <div key={media.id} className="relative">
                            <DraggableImageItem
                              id={media.id}
                              imageUrl={media.imageUrl}
                              thumbnailUrl={media.imageUrl}
                              alt={media.name}
                              onClick={() => handleImageSelect(media)}
                            />
                            {/* Favorite indicator */}
                            {media.isFavorite && (
                              <div className="absolute top-1.5 right-1.5 pointer-events-none">
                                <Heart 
                                  size={12} 
                                  className="text-red-500 fill-red-500"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Unsplash Attribution */}
              {activeTab === "unsplash" && (
                <div 
                  className="relative px-4 py-2 text-center border-t shrink-0"
                  style={{ 
                    borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  }}
                >
                  <a
                    href="https://unsplash.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] opacity-40 hover:opacity-70 transition-opacity inline-flex items-center gap-1"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    Photos by Unsplash
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden"
          style={{
            backgroundColor: isDark ? "#1e1e28" : "#fff",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {selectedImage && (
            <>
              {/* Image Preview */}
              <div className="relative aspect-video bg-black/5">
                <img
                  src={'urls' in selectedImage ? selectedImage.urls.regular : selectedImage.imageUrl}
                  alt={'altDescription' in selectedImage ? (selectedImage.altDescription || "Selected image") : selectedImage.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Image Info & Actions */}
              <div className="p-4 space-y-4">
                <DialogHeader>
                  <DialogTitle 
                    className="text-sm font-medium"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    {'urls' in selectedImage ? (
                      <>
                        Photo by{" "}
                        <a
                          href={`https://unsplash.com/@${(selectedImage as UnsplashPhoto).user.username}?utm_source=butterfast&utm_medium=referral`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          style={{ color: theme.primary }}
                        >
                          {(selectedImage as UnsplashPhoto).user.name}
                        </a>
                        {" "}on{" "}
                        <a
                          href="https://unsplash.com?utm_source=butterfast&utm_medium=referral"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          style={{ color: theme.primary }}
                        >
                          Unsplash
                        </a>
                      </>
                    ) : (
                      (selectedImage as MediaItem).name
                    )}
                  </DialogTitle>
                </DialogHeader>

                {/* Dimensions */}
                {'width' in selectedImage && selectedImage.width && (
                  <p 
                    className="text-xs opacity-50"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    {selectedImage.width} × {selectedImage.height}
                  </p>
                )}

                {/* Use Image Button */}
                <button
                  onClick={handleUseImage}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: theme.primary,
                    color: "#fff",
                  }}
                >
                  Use This Image
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

