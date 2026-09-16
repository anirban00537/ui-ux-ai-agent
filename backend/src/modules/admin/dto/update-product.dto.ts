import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePriceDto {
  @IsString()
  @IsOptional()
  amountType?: 'fixed' | 'custom' | 'free' | 'seat_based' | 'metered_unit';

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

export class UpdateProductDto {
  @IsString()
  @MinLength(3, { message: 'Product name must be at least 3 characters' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsString()
  @IsOptional()
  recurringInterval?: 'day' | 'week' | 'month' | 'year';

  @IsNumber()
  @IsOptional()
  recurringIntervalCount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePriceDto)
  @IsOptional()
  prices?: UpdatePriceDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefitIds?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

