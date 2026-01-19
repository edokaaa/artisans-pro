import {
  IsString,
  IsBoolean,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class RequestServiceDto {
  @IsString()
  jobId: string;

  @IsString()
  description: string;

  @IsBoolean()
  isInstant: boolean;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  date: Date;
  timezone: string;
}
