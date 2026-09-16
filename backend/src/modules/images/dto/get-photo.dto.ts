import { IsString } from 'class-validator';

export class GetPhotoDto {
  @IsString()
  photoId: string;
}

