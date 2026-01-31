import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDesignsList,
  deleteDesign,
  type Design,
} from "@/services/designs";

export const designKeys = {
  all: ["designs"] as const,
  lists: () => [...designKeys.all, "list"] as const,
  list: (filters?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => [...designKeys.lists(), filters] as const,
  detail: (id: string) => [...designKeys.all, "detail", id] as const,
};

export const useDesignsList = (filters?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: designKeys.list(filters),
    queryFn: () => getDesignsList(filters),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useDeleteDesign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDesign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designKeys.lists() });
    },
  });
};
