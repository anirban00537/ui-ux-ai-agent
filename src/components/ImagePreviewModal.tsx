"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconHeart,
  IconHeartFilled,
  IconX,
  IconPhoto,
  IconDownload,
  IconCopy,
  IconChevronLeft,
  IconChevronRight,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { type MediaItem } from "@/services/images";
import { trackEvent } from "@/components/analytics/trackEvent";

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface ImagePreviewModalProps {
  media: MediaItem;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onCopyUrl: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const ImagePreviewModal = ({
  media,
  onClose,
  onPrevious,
  onNext,
  onToggleFavorite,
  onDownload,
  onCopyUrl,
  hasPrevious,
  hasNext,
}: ImagePreviewModalProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isImage = media.mimeType.startsWith("image/");

  // Wait for client-side mount to use portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious) onPrevious();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  // Don't render until mounted (for SSR compatibility)
  if (!mounted) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full z-10 transition-all duration-200 hover:scale-110 bg-accent hover:bg-accent backdrop-blur-md shadow-sm border border-border"
      >
        <IconX size={24} className="text-foreground" />
      </button>

      {/* Navigation arrows */}
      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            trackEvent('media_preview_nav_prev', 'engagement', media.id);
            onPrevious();
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full z-10 transition-all duration-200 hover:scale-110 bg-accent hover:bg-accent backdrop-blur-md shadow-sm border border-border"
        >
          <IconChevronLeft size={28} className="text-foreground" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            trackEvent('media_preview_nav_next', 'engagement', media.id);
            onNext();
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full z-10 transition-all duration-200 hover:scale-110 bg-accent hover:bg-accent backdrop-blur-md shadow-sm border border-border"
        >
          <IconChevronRight size={28} className="text-foreground" />
        </button>
      )}

      {/* Main content */}
      <div
        className="relative flex flex-col max-w-[90vw] max-h-[90vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/50"
        >
          {isImage ? (
            <img
              src={media.imageUrl}
              alt={media.name}
              className="max-w-full max-h-[75vh] object-contain"
              style={{
                minWidth: "300px",
                minHeight: "200px",
              }}
            />
          ) : (
            <div className="w-96 h-64 flex items-center justify-center bg-muted/20">
              <IconPhoto size={64} className="text-muted-foreground" />
            </div>
          )}

          {/* Glass overlay at bottom with title */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          >
            <p className="text-foreground font-medium truncate">{media.name}</p>
            <p className="text-muted-foreground text-sm">
              {formatFileSize(media.size)} • {media.width && media.height ? `${media.width} × ${media.height}` : formatDate(media.createdAt)}
            </p>
          </div>
        </motion.div>

        {/* Action bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mt-4"
        >
          <button
            onClick={() => {
              trackEvent('media_preview_favorite_toggle', 'engagement', media.id);
              onToggleFavorite();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 bg-accent hover:bg-accent backdrop-blur-md border border-border"
          >
            {media.isFavorite ? (
              <IconHeartFilled size={18} className="text-red-400" />
            ) : (
              <IconHeart size={18} className="text-foreground" />
            )}
            <span className="text-foreground text-sm font-medium">
              {media.isFavorite ? "Favorited" : "Favorite"}
            </span>
          </button>

          <button
            onClick={() => {
              trackEvent('media_preview_copy_url', 'engagement', media.id);
              onCopyUrl();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 bg-accent hover:bg-accent backdrop-blur-md border border-border"
          >
            <IconCopy size={18} className="text-foreground" />
            <span className="text-foreground text-sm font-medium">Copy URL</span>
          </button>

          <button
            onClick={() => {
              trackEvent('media_preview_download', 'engagement', media.id);
              onDownload();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 bg-accent hover:bg-accent backdrop-blur-md border border-border"
          >
            <IconDownload size={18} className="text-foreground" />
            <span className="text-foreground text-sm font-medium">Download</span>
          </button>

          <button
            onClick={() => {
              trackEvent('media_preview_info_toggle', 'engagement', media.id);
              setShowInfo(!showInfo);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 bg-accent hover:bg-accent backdrop-blur-md border border-border",
              showInfo && "bg-accent ring-1 ring-border"
            )}
          >
            <IconInfoCircle size={18} className="text-foreground" />
            <span className="text-foreground text-sm font-medium">Info</span>
          </button>
        </motion.div>

        {/* Info panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="mt-4 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">File Name</p>
                  <p className="text-foreground font-medium truncate">{media.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">File Type</p>
                  <p className="text-foreground font-medium">{media.mimeType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Size</p>
                  <p className="text-foreground font-medium">{formatFileSize(media.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Dimensions</p>
                  <p className="text-foreground font-medium">
                    {media.width && media.height ? `${media.width} × ${media.height} px` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Uploaded</p>
                  <p className="text-foreground font-medium">{formatDate(media.createdAt)}</p>
                </div>
                {media.tags.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {media.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-accent text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};
