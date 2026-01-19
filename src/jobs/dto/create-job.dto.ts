import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateJobDto {
  @IsString()
  name: string;

  @IsString()
  skillId: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @IsBoolean()
  usesEscrow: boolean;
}
