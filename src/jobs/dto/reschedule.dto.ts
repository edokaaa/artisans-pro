import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class RescheduleDto {
  @IsNotEmpty()
  rescheduledDateTime: Date;

  @IsNotEmpty()
  reason: string;
}
