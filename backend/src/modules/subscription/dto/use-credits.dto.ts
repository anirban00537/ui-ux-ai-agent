import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class UseCreditsDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  docId?: string;
}

