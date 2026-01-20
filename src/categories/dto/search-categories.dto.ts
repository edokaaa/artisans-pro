import { IsOptional, IsString } from 'class-validator';

export class SearchCategoriesDto {
  @IsOptional()
  @IsString()
  q?: string;
}
