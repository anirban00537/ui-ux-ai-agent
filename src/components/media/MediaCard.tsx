"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  IconTrash,
  IconEdit,
  IconHeart,
  IconHeartFilled,
  IconPhoto,
  IconDownload,
  IconCopy,
  IconDots,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface MediaCardProps {
  media: MediaItem;
  onEdit: (media: MediaItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (media: MediaItem) => void;
  onClick: (media: MediaItem) => void;
  isDeleting: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  isDeleting,
}) => {
  const isImage = media.mimeType.startsWith("image/");

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(media.imageUrl);
    toast.success("URL copied to clipboard");
    trackEvent('media_copy_url', 'engagement', media.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = media.imageUrl;
    a.download = media.name;
    a.click();
    toast.success("Download started");
    trackEvent('media_download', 'engagement', media.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(media);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-depth-3 hover:border-primary/20 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div 
        className="relative aspect-square bg-secondary/5 overflow-hidden cursor-pointer"
        onClick={() => {
          trackEvent('media_preview_click', 'engagement', media.id);
          onClick(media);
        }}
      >
        {isImage ? (
          <img
            src={media.imageUrl}
            alt={media.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconPhoto size={48} className="text-secondary/30" />
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-20 backdrop-blur-[2px]">
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded-full bg-card/90 shadow-sm hover:scale-110 transition-transform text-foreground hover:text-primary"
          >
            <IconCopy size={18} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-card/90 shadow-sm hover:scale-110 transition-transform text-foreground hover:text-primary"
          >
            <IconDownload size={18} />
          </button>
        </div>

        {/* Favorite badge */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform z-20 opacity-0 group-hover:opacity-100 data-[favorite=true]:opacity-100"
          data-favorite={media.isFavorite}
        >
          {media.isFavorite ? (
            <IconHeartFilled size={16} className="text-red-500" />
          ) : (
            <IconHeart size={16} className="text-muted-foreground hover:text-red-500" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="relative p-3 z-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {media.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
              {formatFileSize(media.size)} • {formatDate(media.createdAt)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary/10 rounded-md outline-none"
              >
                <IconDots size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border border-border shadow-lg bg-card backdrop-blur-md"
            >
              <DropdownMenuItem
                onClick={() => onEdit(media)}
                className="rounded-lg cursor-pointer"
              >
                <IconEdit size={16} className="mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCopyUrl}
                className="rounded-lg cursor-pointer"
              >
                <IconCopy size={16} className="mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownload}
                className="rounded-lg cursor-pointer"
              >
                <IconDownload size={16} className="mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                onClick={() => onDelete(media.id)}
                className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <IconTrash size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        {media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {media.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-secondary/10 text-secondary-foreground border border-secondary/10"
              >
                {tag}
              </span>
            ))}
            {media.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-muted/50 text-muted-foreground">
                +{media.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-30">
          <IconLoader2 size={24} className="animate-spin text-primary" />
        </div>
      )}
    </motion.div>
  );
};
