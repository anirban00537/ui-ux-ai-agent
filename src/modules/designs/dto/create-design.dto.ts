import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDesignDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  html: string;
}
