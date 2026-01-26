import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class SearchProvidersDto {
  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
