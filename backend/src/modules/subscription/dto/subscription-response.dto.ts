import { IsString, IsBoolean, IsDate, IsOptional, IsInt, IsObject } from 'class-validator';

export class SubscriptionResponseDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  polarSubscriptionId?: string;

  @IsString()
  @IsOptional()
  polarCustomerId?: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  priceId?: string;

  @IsDate()
  @IsOptional()
  currentPeriodStart?: Date;

  @IsDate()
  @IsOptional()
  currentPeriodEnd?: Date;

  @IsBoolean()
  cancelAtPeriodEnd: boolean;

  @IsDate()
  @IsOptional()
  canceledAt?: Date;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

