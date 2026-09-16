import { Artboard } from '@prisma/client';

export class DesignResponseDto {
  success: boolean;
  message: string;
  data?: Artboard | Artboard[];
}

export interface DesignWithUser {
  id: string;
  conversationId: string;
  title: string;
  description: string | null;
  html: string;
  createdAt: Date;
  conversation: {
    id: string;
    userId: string;
    title: string | null;
    colorPalette: any;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}
