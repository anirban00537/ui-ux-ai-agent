import request from "@/lib/request";

export interface Design {
  id: string;
  userId: string;
  title: string | null;
  colorPalette: any;
  createdAt: string;
  updatedAt: string;
  screens?: { id: string; title: string; description?: string | null }[];
}

export interface DesignListResponse {
  success: boolean;
  message: string;
  data: {
    items: Design[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

export interface CreateDesignConversationResponse {
  success: boolean;
  message: string;
  data: Design;
}

export async function getDesignsList(params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const response = await request.get<DesignListResponse>("/designs", {
    params,
  });
  return response.data;
}

export async function createDesignConversation(title: string) {
  const response = await request.post<CreateDesignConversationResponse>(
    "/designs/conversations",
    { title }
  );
  return response.data;
}

export async function getDesignById(designId: string) {
  const response = await request.get(`/designs/${designId}`);
  return response.data;
}

export async function deleteDesign(designId: string) {
  const response = await request.delete(`/designs/${designId}`);
  return response.data;
}
