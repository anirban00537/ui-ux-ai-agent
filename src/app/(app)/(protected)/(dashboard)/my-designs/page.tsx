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
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)]">
      <div className="relative z-10 w-full flex-1 px-4 py-8 md:px-8 overflow-y-auto">
        <PageHeader
          title={
            <>
              My <span className="text-primary italic">Designs</span>
            </>
          }
          action={
            <Button
              onClick={() => router.push("/home")}
              variant="default"
              className="shadow-coral-glow hover:scale-105 transition-transform"
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
        <AlertDialogContent className="rounded-2xl border-0 bg-card/90 backdrop-blur-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{designToDelete?.title}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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
