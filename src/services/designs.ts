import request from "@/lib/request";

export interface Design {
  id: string;
  userId: string;
  title: string | null;
  colorPalette: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignConversationResponse {
  success: boolean;
  message: string;
  data: Design;
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
