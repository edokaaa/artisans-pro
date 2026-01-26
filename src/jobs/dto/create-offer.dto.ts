import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  serviceProviderId: string;

  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsString()
  taskDescription: string;

  @IsBoolean()
  useEscrow: boolean;
}
