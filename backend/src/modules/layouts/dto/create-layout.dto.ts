import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLayoutDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail?: string;

  @IsObject()
  data: any; // Layout/template data (JSON) - similar to Card data

  @IsOptional()
  @IsString()
  type?: 'admin' | 'user'; // Defaults to 'user'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  published?: boolean;
}

