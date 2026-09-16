import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsObject } from 'class-validator';
import { BenefitResponseDto } from './feature-response.dto';

export class PriceResponseDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  amountType?: string; // fixed, custom, free, seat_based, metered_unit

  @IsNumber()
  @IsOptional()
  priceAmount?: number; // in cents

  @IsString()
  @IsOptional()
  priceCurrency?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ProductResponseDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsString()
  @IsOptional()
  recurringInterval?: string; // day, week, month, year

  @IsNumber()
  @IsOptional()
  recurringIntervalCount?: number;

  @IsArray()
  @IsOptional()
  prices?: PriceResponseDto[];

  @IsArray()
  @IsOptional()
  benefits?: BenefitResponseDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  features?: string[]; // Extracted feature list from benefits and metadata

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsNumber()
  @IsOptional()
  monthlyCreditLimit?: number;
}

