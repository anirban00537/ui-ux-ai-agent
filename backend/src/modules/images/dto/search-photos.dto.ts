import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPhotosDto {
  @IsString()
  query: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(30)
  perPage?: number = 10;

  @IsOptional()
  @IsString()
  orientation?: 'landscape' | 'portrait' | 'squarish';

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  orderBy?: 'relevant' | 'latest';
}

