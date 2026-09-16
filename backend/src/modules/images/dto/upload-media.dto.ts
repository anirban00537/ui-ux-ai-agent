import { IsOptional, IsString, IsArray } from 'class-validator';

export class UploadMediaDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

