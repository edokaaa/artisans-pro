import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsPhoneNumber,
} from 'class-validator';
import { IdType } from 'src/common/enums/id-type.enum';
import { CreateProfileDto } from './create-profile.dto';

export class CreateServiceProviderDto extends CreateProfileDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  companyName?: string;

  @IsArray()
  workPhotoUrls: string[];

  @IsEnum(IdType)
  idType: IdType;

  @IsString()
  idNumber: string;

  @IsString()
  idPhotoFrontUrl: string;

  @IsOptional()
  idPhotoBackUrl?: string;

  @IsString()
  selfieUrl: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsArray()
  skillIds: string[];
}
