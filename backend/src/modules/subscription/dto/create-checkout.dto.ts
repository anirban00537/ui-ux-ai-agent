import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @IsUrl(
    { require_tld: false }, // Allow localhost URLs for development
    { message: 'Success URL must be a valid URL' },
  )
  @IsOptional()
  successUrl?: string;
}
