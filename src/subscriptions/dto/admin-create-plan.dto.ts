import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class AdminCreatePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  interval: 'monthly';

  @IsOptional()
  @IsNumber()
  maxJobs?: number;

  @IsOptional()
  @IsNumber()
  maxActiveOffers?: number;

  @IsBoolean()
  isActive?: boolean;
}
