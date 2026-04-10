"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useDesignsList, useDeleteDesign } from "@/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@/components/ui";
import { toast } from "sonner";
import { IconDeviceMobile, IconPlus } from "@tabler/icons-react";

import { EmptyState, GridSkeleton, Pagination, PageHeader } from "@/components/shared";
import { DesignCard } from "@/components/my-designs";

export default function MyDesignsPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const LIMIT = 18;

  const { data: designsResponse, isLoading } = useDesignsList({
    page,
    pageSize: LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const deleteDesignMutation = useDeleteDesign();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [designToDelete, setDesignToDelete] = React.useState<{
    id: string;
    title: string;
  } | null>(null);

  const designs = designsResponse?.success
    ? designsResponse.data?.items || []
    : [];

  const pagination = designsResponse?.success
    ? designsResponse.data?.pagination
    : null;

  const totalPages = pagination?.totalPages || 1;

  const handleEdit = (designId: string) => {
    router.push(`/designs/${designId}`);
  };

  const handleDelete = (id: string, title: string) => {
    setDesignToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!designToDelete) return;
    try {
      await deleteDesignMutation.mutateAsync(designToDelete.id);
      setDeleteDialogOpen(false);
      setDesignToDelete(null);
      toast.success("Design deleted successfully");
    } catch {
      toast.error("Failed to delete design");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)] bg-[#1f2228]">
      <div className="relative z-10 w-full flex-1 px-4 py-8 md:px-8 overflow-y-auto">
        <PageHeader
          title={
            <>My Designs</>
          }
          action={
            <Button
              onClick={() => router.push("/home")}
              className="font-mono"
            >
              <IconPlus size={18} className="mr-2" />
              New Design
            </Button>
          }
        />

        {isLoading ? (
          <GridSkeleton count={LIMIT} aspectRatio="video" />
        ) : designs.length === 0 ? (
          <EmptyState
            icon={IconDeviceMobile}
            title="No designs yet"
            description="Create your first mobile app design to get started. Describe your app idea and our AI will generate beautiful screens for you."
            actionText="Create Design"
            onAction={() => router.push("/home")}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              <AnimatePresence mode="popLayout">
                {designs.map((design: any, index: number) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border border-white/10 bg-[#1f2228]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-white">Delete Design</AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-white/50">
              Are you sure you want to delete &ldquo;{designToDelete?.title}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono border border-white/20 bg-transparent text-white hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="font-mono bg-red-500 text-white hover:bg-red-500/90"
              disabled={deleteDesignMutation.isPending}
            >
              {deleteDesignMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
