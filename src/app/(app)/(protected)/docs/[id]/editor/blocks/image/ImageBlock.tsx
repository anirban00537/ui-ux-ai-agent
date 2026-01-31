import React, { useState, memo } from "react";
import type { Block, Theme } from "@/types";
import { type ImageContent } from "@/types";
import { IconPhoto, IconExternalLink, IconRectangleVertical, IconRectangle, IconPhotoPlus } from "@tabler/icons-react";
import { CommonCard } from "../CommonCard";
import { cn } from "@/lib/utils";
import {
  ImagePickerModal,
  type SelectedImage,
} from "../../panels/ImagePickerModal";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { useCallback } from "react";

interface ImageBlockProps {
  block: Block;
  onUpdate: (content: ImageContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
  isStreaming?: boolean;
}

export const ImageBlock = memo(function ImageBlock({
  block,
  onUpdate,
  theme,
  readOnly = false,
  isStreaming = false,
}: ImageBlockProps) {
  const content = block.content as ImageContent;
  const { imageUrl, alt, caption, objectFit = "cover", height = 450, attribution } = content;
  const isDark = theme.themeType === "dark";

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageSelect = (image: SelectedImage) => {
    onUpdate({
      ...content,
      imageUrl: image.imageUrl,
      imageQuery: undefined, // Clear query once image is selected
      alt: image.alt || "",
      attribution: image.attribution,
    });
    setIsModalOpen(false);
  };

  const handleImageLoaded = useCallback((loadedUrl: string) => {
    onUpdate({ 
      ...content, 
      imageUrl: loadedUrl,
      imageQuery: undefined // Clear query once loaded
    });
  }, [content, onUpdate]);

  const { url, isLoading } = useLazyImage({
    imageUrl,
    imageQuery: content.imageQuery,
    orientation: 'landscape',
    onImageLoaded: handleImageLoaded,
    disabled: isStreaming,
  });

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    onUpdate({ ...content, caption: e.target.value });
  };

  const toggleHeightMode = () => {
    if (readOnly) return;
    // Modes: Standard (450), Wide (300), Natural (0)
    let nextHeight = 450;
    if (height === 450) nextHeight = 300;
    else if (height === 300) nextHeight = 0; // Natural
    else nextHeight = 450;

    onUpdate({ 
      ...content, 
      type: "image",
      height: nextHeight,
      // Default to cover for fixed heights, contain for natural
      objectFit: nextHeight === 0 ? "contain" : "cover"
    });
  };

  const getHeightIcon = () => {
    if (height === 0) return <IconPhotoPlus size={14} />;
    if (height === 300) return <IconRectangle size={14} />;
    return <IconRectangleVertical size={14} />;
  };

  const getHeightLabel = () => {
    if (height === 0) return "Original (Natural)";
    if (height === 300) return "Wide (Panoramic)";
    return "Classic (Standard)";
  };

  const openModal = () => {
    if (readOnly) return;
    setIsModalOpen(true);
  };

  // Placeholder / Loading state - show placeholder only if we have no URL yet
  // Once url is set (either from props or from fetch), show the image
  const hasUrl = url && url.length > 0;
  const isFetchingFromQuery = isLoading && !!content.imageQuery;

  if (!hasUrl) {
    return (
      <div className="w-full">
        <CommonCard
          theme={theme}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden",
            height === 0 ? "h-64" : ""
          )}
          style={{
            borderRadius: "24px",
            height: height > 0 ? `${height}px` : "256px",
            color: theme.bodyColor,
          }}
        >
          <ImagePlaceholder 
            isLoading={isFetchingFromQuery} 
            onClick={openModal}
            className="border-none bg-transparent h-full"
          />
        </CommonCard>

        {!readOnly && (
          <ImagePickerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleImageSelect}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <CommonCard 
        theme={theme}
        className="w-full h-full min-w-0 min-h-0 flex flex-col gap-0 group/image relative p-0 overflow-hidden border-none transition-all duration-500"
        style={{ borderRadius: "24px" }}
      >
        {/* Image Container */}
        <div 
          className={cn(
            "relative w-full overflow-hidden transition-all duration-500",
            height === 0 ? "h-auto" : "flex-1 min-h-0"
          )}
          style={{
            backgroundColor: `${theme.primary}05`,
            height: height > 0 ? `${height}px` : "auto",
            minHeight: height > 0 ? `${height}px` : "200px",
            maxHeight: height > 0 ? `${height}px` : "100%"
          }}
        >
          <img
            key={`${url}-${height}`}
            src={url}
            crossOrigin="anonymous"
            alt={alt || caption || "Image"}
            className={cn(
              "w-full h-full transition-transform duration-700 ease-out",
              height === 0 ? "object-contain" : "object-cover"
            )}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: height === 0 ? "contain" : "cover"
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />

          {/* Corner Change Image Button - Always visible on hover */}
          {!readOnly && (
            <button
              onClick={openModal}
              className="absolute top-3 left-3 z-20 p-2 rounded-xl opacity-0 group-hover/image:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg bg-white/90 backdrop-blur-sm"
              title="Change image"
            >
              <IconPhoto size={18} stroke={2} className="text-neutral-700" />
            </button>
          )}
          
          {/* Height Mode Button - Corner positioned */}
          {!readOnly && (
            <button
              onClick={toggleHeightMode}
              className="absolute top-3 right-3 z-20 p-2 rounded-xl opacity-0 group-hover/image:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg bg-white/90 backdrop-blur-sm flex items-center gap-1"
              title={`Current: ${getHeightLabel()}`}
            >
              {getHeightIcon()}
            </button>
          )}
        </div>
      </CommonCard>

      {!readOnly && (
        <ImagePickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleImageSelect}
        />
      )}
    </>
  );
});
