import { IsEnum, IsOptional } from 'class-validator';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';

export class AdminUpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}
