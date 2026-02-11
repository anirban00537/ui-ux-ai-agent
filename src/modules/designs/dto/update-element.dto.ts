import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateElementDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsNotEmpty()
  @IsString()
  elementHtml: string;

  @IsOptional()
  @IsString()
  screenContext?: string;
}
