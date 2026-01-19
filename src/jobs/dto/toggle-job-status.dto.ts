import { IsBoolean } from 'class-validator';

export class ToggleJobStatusDto {
  @IsBoolean()
  isActive: boolean;
}
