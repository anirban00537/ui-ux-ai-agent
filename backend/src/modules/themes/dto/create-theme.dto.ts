import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ThemeDataDto {
  // Frontend format (primary format)
  @IsOptional()
  @IsString()
  primary?: string;

  @IsOptional()
  @IsString()
  headingColor?: string;

  @IsOptional()
  @IsString()
  bodyColor?: string;

  @IsOptional()
  @IsString()
  cardBackground?: string;

  @IsOptional()
  @IsString()
  pageBackground?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  // Legacy format (for backward compatibility)
  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsString()
  surface?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  accent?: string;

  @IsOptional()
  @IsString()
  font?: string;

  @IsOptional()
  @IsString()
  cardBackgroundType?: 'solid' | 'glass' | 'transparent';

  @IsOptional()
  @IsString({ each: true })
  secondaryColors?: string[];

  @IsOptional()
  @IsString()
  cardDesignPattern?: string;

  @IsOptional()
  @IsString()
  cardBorderStyle?: string;

  @IsOptional()
  cardRoundness?: number;

  @IsOptional()
  @IsString()
  borderColor?: string;

  @IsOptional()
  @IsString()
  cardTransparency?: 'default' | 'faded' | 'frosted';

  @IsOptional()
  @IsString()
  cardShadow?: 'none' | 'soft' | 'hard' | 'floating' | 'glow';

  @IsOptional()
  @IsString()
  tone?: 'dark' | 'light';
}

export class CreateThemeDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ThemeDataDto)
  themeData: ThemeDataDto;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

