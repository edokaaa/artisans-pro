import { IsString } from 'class-validator';

export class CreateCategorySkillDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;
}
