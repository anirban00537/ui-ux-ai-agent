import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class BenefitResponseDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  type?: string; // custom, etc.

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  selectable?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;
}

export class FeatureResponseDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  productDescription?: string;

  @IsArray()
  @IsOptional()
  benefits?: BenefitResponseDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>; // e.g., ai_credits, etc.

  @IsArray()
  @IsOptional()
  features?: string[]; // Extracted feature list from benefits and metadata
}
