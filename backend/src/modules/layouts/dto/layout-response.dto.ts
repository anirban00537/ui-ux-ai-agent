export class LayoutResponseDto {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  thumbnail?: string;
  data: any; // Layout/template data (JSON)
  type: 'admin' | 'user';
  tags: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

