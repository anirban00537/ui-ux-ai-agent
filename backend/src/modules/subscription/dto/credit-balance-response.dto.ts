import { IsString, IsInt, IsDate, IsOptional } from 'class-validator';

export class CreditBalanceResponseDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsInt()
  balance: number;

  @IsInt()
  quota: number;

  @IsInt()
  usedCredits: number;

  @IsDate()
  @IsOptional()
  lastResetAt?: Date;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

