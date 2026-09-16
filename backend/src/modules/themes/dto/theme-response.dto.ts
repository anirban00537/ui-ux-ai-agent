export class ThemeResponseDto {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  themeData: {
    background: string;
    surface: string;
    text: string;
    accent: string;
    font: string;
    cardBackgroundType: 'solid' | 'glass' | 'transparent';
    tone: 'dark' | 'light';
  };
  isAdmin: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

