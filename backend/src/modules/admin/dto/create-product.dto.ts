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

export class CreatePriceDto {
  @IsString()
  amountType: 'fixed' | 'custom' | 'free' | 'seat_based' | 'metered_unit';

  @IsNumber()
  @IsOptional()
  priceAmount?: number; // in cents

  @IsString()
  @IsOptional()
  priceCurrency?: string; // defaults to 'usd'

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateProductDto {
  @IsString()
  @MinLength(3, { message: 'Product name must be at least 3 characters' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  recurringInterval?: 'day' | 'week' | 'month' | 'year';

  @IsNumber()
  @IsOptional()
  recurringIntervalCount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePriceDto)
  prices: CreatePriceDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefitIds?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

