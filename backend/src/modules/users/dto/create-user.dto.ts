import {
  IsEmail,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

/** Describes the fields needed to create a User */
export class CreateUserDto {
  /**
   * User's full name
   * @example "John Doe"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Username
   */
  @IsOptional()
  @IsString()
  user_name?: string;

  /**
   * User email
   * @example "user@example.com"
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * User password
   */
  @IsOptional()
  @IsString()
  password?: string;

  /**
   * User login provider
   */
  @IsOptional()
  @IsString()
  login_provider?: string;

  /**
   * Whether email is verified
   */
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
