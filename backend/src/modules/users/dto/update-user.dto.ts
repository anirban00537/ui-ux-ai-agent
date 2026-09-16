import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Describes the User fields that are updatable */
export class UpdateUserDto {
  /**
   * User full name
   * @example "John Doe"
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * User profile image
   */
  @IsOptional()
  @IsString()
  image?: string;
  
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birth_date?: Date;

  @IsOptional()
  @IsNumber()
  gender?: number;
}
