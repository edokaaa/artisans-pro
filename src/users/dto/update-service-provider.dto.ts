import { IsString, IsOptional, IsArray, IsPhoneNumber } from 'class-validator';

export class UpdateServiceProviderDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  companyName?: string;

  @IsArray()
  workPhotoUrls?: string[];

  @IsString()
  selfieUrl?: string;

  @IsString()
  state?: string;

  @IsString()
  city?: string;

  @IsPhoneNumber()
  phoneNumber?: string;

  @IsArray()
  skillIds: string[];
}
