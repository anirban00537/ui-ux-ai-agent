"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCheck, IconLoader2, IconPhoto, IconUpload } from "@tabler/icons-react";
import { trackEvent } from "@/components/analytics/trackEvent";
import {
  useListMedia,
  useUploadMedia,
  useUpdateMedia,
  useDeleteMedia,
} from "@/hooks";
import { type MediaItem, type ListMediaParams } from "@/services/images";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  Button,
} from "@/components/ui";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";

// Shared components
import { EmptyState, GridSkeleton, Pagination, PageHeader } from "@/components/shared";


// Sub-components
import { MediaCard, MediaFilters, type CategoryFilter } from "@/components/media";

// Main Media Page
export default function MediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  // API hooks
  const listParams: ListMediaParams = {
    search: searchQuery || undefined,
    category: category,
    perPage: PER_PAGE,
    page,
  };

  const { data: mediaResponse, isLoading, error } = useListMedia(listParams);
  const uploadMutation = useUploadMedia();
  const updateMutation = useUpdateMedia();
  const deleteMutation = useDeleteMedia();

  const mediaItems = mediaResponse?.data?.list || [];
  const pagination = mediaResponse?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // Handle file upload
  const handleUpload = useCallback(() => {
    trackEvent('media_upload_click', 'engagement', 'library');
    fileInputRef.current?.click();
  }, []);

  const handlePageChange = (newPage: number) => {
    trackEvent('media_pagination_change', 'engagement', `page_${newPage}`);
    setPage(newPage);
    // Scroll to top when changing pages
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        await uploadMutation.mutateAsync({ file, name: file.name });
        return { success: true, name: file.name };
      } catch {
        return { success: false, name: file.name };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (successful > 0) {
      trackEvent('media_upload_success', 'engagement', `count_${successful}`);
      toast.success(`${successful} file${successful > 1 ? "s" : ""} uploaded successfully`);
    }
    if (failed > 0) {
      trackEvent('media_upload_error', 'engagement', `count_${failed}`);
      toast.error(`${failed} file${failed > 1 ? "s" : ""} failed to upload`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle edit
  const handleEdit = (media: MediaItem) => {
    setEditingMedia(media);
    setEditName(media.name);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia || !editName.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: editingMedia.id,
        params: { name: editName.trim() },
      });
      toast.success("Media renamed successfully");
      setEditingMedia(null);
      trackEvent('media_rename_success', 'engagement', editingMedia.id);
    } catch {
      toast.error("Failed to rename media");
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (media: MediaItem) => {
    try {
      await updateMutation.mutateAsync({
        id: media.id,
        params: { isFavorite: !media.isFavorite },
      });
      toast.success(media.isFavorite ? "Removed from favorites" : "Added to favorites");
      trackEvent('media_favorite_toggle', 'engagement', media.id);
    } catch {
      toast.error("Failed to update favorite status");
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setMediaToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    setDeletingId(mediaToDelete);
    setShowDeleteDialog(false);
    try {
      await deleteMutation.mutateAsync(mediaToDelete);
      toast.success("Media deleted successfully");
      trackEvent('media_delete_success', 'engagement', mediaToDelete);
    } catch {
      toast.error("Failed to delete media");
    } finally {
      setDeletingId(null);
      setMediaToDelete(null);
    }
  };

  // Preview navigation
  const handlePreviewPrevious = useCallback(() => {
    if (!previewMedia) return;
    const currentIndex = mediaItems.findIndex((m) => m.id === previewMedia.id);
    if (currentIndex > 0) setPreviewMedia(mediaItems[currentIndex - 1]);
  }, [previewMedia, mediaItems]);

  const handlePreviewNext = useCallback(() => {
    if (!previewMedia) return;
    const currentIndex = mediaItems.findIndex((m) => m.id === previewMedia.id);
    if (currentIndex < mediaItems.length - 1) setPreviewMedia(mediaItems[currentIndex + 1]);
  }, [previewMedia, mediaItems]);

  const handlePreviewDownload = useCallback(() => {
    if (!previewMedia) return;
    const a = document.createElement("a");
    a.href = previewMedia.imageUrl;
    a.download = previewMedia.name;
    a.click();
    toast.success("Download started");
  }, [previewMedia]);

  const handlePreviewCopyUrl = useCallback(async () => {
    if (!previewMedia) return;
    await navigator.clipboard.writeText(previewMedia.imageUrl);
    toast.success("URL copied to clipboard");
  }, [previewMedia]);

  const handlePreviewToggleFavorite = useCallback(async () => {
    if (!previewMedia) return;
    try {
      await updateMutation.mutateAsync({
        id: previewMedia.id,
        params: { isFavorite: !previewMedia.isFavorite },
      });
      setPreviewMedia({ ...previewMedia, isFavorite: !previewMedia.isFavorite });
      toast.success(previewMedia.isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update favorite status");
    }
  }, [previewMedia, updateMutation]);

  return (
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)] ">

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative z-10 w-full flex-1 px-4 py-8 md:px-8 overflow-y-auto">
        <PageHeader
          title={<>Media <span className="text-primary italic">Library</span></>}
          subtitle="Manage your images and assets in one central place."
          action={
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              variant="default"
              className="shadow-coral-glow hover:scale-105 transition-transform"
            >
              {uploadMutation.isPending ? (
                <IconLoader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <IconUpload size={18} className="mr-2" />
              )}
              Upload Media
            </Button>
          }
        />

        <MediaFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          category={category}
          onCategoryChange={setCategory}
        />

        {!isLoading && mediaItems.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-4 font-medium"
          >
            {pagination?.total || mediaItems.length} item{pagination?.total !== 1 ? "s" : ""}
          </motion.p>
        )}

        {isLoading ? (
          <GridSkeleton count={10} aspectRatio="square" />
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 p-6 text-sm text-destructive bg-destructive/10 backdrop-blur-md">
            Failed to load media. Please try again.
          </div>
        ) : mediaItems.length === 0 ? (
          <EmptyState
            icon={IconPhoto}
            title="No media yet"
            description="Upload images to use in your docs. They'll be stored securely and accessible from anywhere."
            actionText="Upload Media"
            onAction={handleUpload}
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {mediaItems.map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={setPreviewMedia}
                    isDeleting={deletingId === media.id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {previewMedia && (
          <ImagePreviewModal
            media={previewMedia}
            onClose={() => setPreviewMedia(null)}
            onPrevious={handlePreviewPrevious}
            onNext={handlePreviewNext}
            onToggleFavorite={handlePreviewToggleFavorite}
            onDownload={handlePreviewDownload}
            onCopyUrl={handlePreviewCopyUrl}
            hasPrevious={mediaItems.findIndex((m) => m.id === previewMedia.id) > 0}
            hasNext={mediaItems.findIndex((m) => m.id === previewMedia.id) < mediaItems.length - 1}
          />
        )}
      </AnimatePresence>

      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-card/90 backdrop-blur-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>Rename Media</DialogTitle>
            <DialogDescription>Enter a new name for this media file.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter name..."
              className="rounded-xl h-11"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingMedia(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim() || updateMutation.isPending} className="rounded-xl">
              {updateMutation.isPending ? <IconLoader2 size={16} className="mr-2 animate-spin" /> : <IconCheck size={16} className="mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-0 bg-card/90 backdrop-blur-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this media? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
