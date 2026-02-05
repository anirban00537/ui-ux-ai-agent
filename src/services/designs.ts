import request from "@/lib/request";

export type DesignType = "mobile_app";

export interface Design {
  id: string;
  userId: string;
  title: string | null;
  type: DesignType;
  colorPalette: any;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  artboards?: { 
    id: string; 
    title: string; 
    description?: string | null; 
    html: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }[];
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

export async function createDesignConversation(title: string, type: DesignType = "mobile_app") {
  const response = await request.post<CreateDesignConversationResponse>(
    "/designs/conversations",
    { title, type }
  );
  return response.data;
}

export async function getDesignById(designId: string) {
  const response = await request.get(`/designs/${designId}`);
  return response.data;
}

export async function getPublicDesignById(designId: string) {
  const response = await request.get(`/designs/public/${designId}`);
  return response.data;
}

export async function deleteDesign(designId: string) {
  const response = await request.delete(`/designs/${designId}`);
  return response.data;
}

export async function updateDesign(
  designId: string,
  data: { title?: string; colorPalette?: Record<string, string>; isPublic?: boolean }
) {
  const response = await request.patch(`/designs/${designId}`, data);
  return response.data;
}

export async function updateArtboard(
  artboardId: string,
  data: { x?: number; y?: number; width?: number; height?: number }
) {
  const response = await request.patch(`/designs/artboards/${artboardId}`, data);
  return response.data;
}

export async function deleteArtboard(artboardId: string) {
  const response = await request.delete(`/designs/artboards/${artboardId}`);
  return response.data;
}

export async function getDesignMessages(
  designId: string,
  params?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) {
  const response = await request.get(`/designs/${designId}/messages`, {
    params,
  });
  return response.data;
}
