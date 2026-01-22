import {
  IsString,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
} from 'class-validator';

export class RequestServiceDto {
  @IsString()
  jobId: string;

  @IsString()
  description: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsBoolean()
  isInstant: boolean;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  date: Date;

  timezone: string;
}
