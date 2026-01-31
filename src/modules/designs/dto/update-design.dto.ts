import { IsOptional, IsString } from 'class-validator';

export class UpdateDesignDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  html?: string;
}
