import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  exportArtboardImage, 
  exportArtboardHtml, 
  exportDesignImages, 
  exportDesignHtml,
  getArtboardCode
} from "@/services/designs";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export const useExportArtboard = () => {
  const exportImage = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const blob = await exportArtboardImage(id);
      saveAs(blob, title.endsWith(".png") ? title : `${title}.png`);
    },
    onError: (error) => {
      console.error("Export image failed:", error);
      toast.error("Failed to export image");
    }
  });

  const exportHtml = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const blob = await exportArtboardHtml(id);
      saveAs(blob, title.endsWith(".html") ? title : `${title}.html`);
    },
    onError: (error) => {
      console.error("Export HTML failed:", error);
      toast.error("Failed to export HTML");
    }
  });

  return {
    exportImage,
    exportHtml,
    isExporting: exportImage.isPending || exportHtml.isPending
  };
};

export const useExportDesign = () => {
  const exportAllImages = useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const blob = await exportDesignImages(id);
      saveAs(blob, filename.endsWith(".zip") ? filename : `${filename}.zip`);
    },
    onError: (error) => {
      console.error("Bulk image export failed:", error);
      toast.error("Failed to export all images");
    }
  });

  const exportAllHtml = useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const blob = await exportDesignHtml(id);
      saveAs(blob, filename.endsWith(".zip") ? filename : `${filename}.zip`);
    },
    onError: (error) => {
      console.error("Bulk HTML export failed:", error);
      toast.error("Failed to export all HTML");
    }
  });

  return {
    exportAllImages,
    exportAllHtml,
    isExporting: exportAllImages.isPending || exportAllHtml.isPending
  };
};

export const useArtboardCode = (artboardId: string | null) => {
  return useQuery({
    queryKey: ["artboard", "code", artboardId],
    queryFn: () => artboardId ? getArtboardCode(artboardId) : null,
    enabled: !!artboardId,
  });
};
