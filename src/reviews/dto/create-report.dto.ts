import { IsString, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  serviceProviderId: string;

  @IsOptional()
  comment?: string;
}
