import { IsString, IsOptional, IsLatitude, IsLongitude } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  timezone?: string;
}
