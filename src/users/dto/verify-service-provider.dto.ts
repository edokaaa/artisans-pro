import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from 'src/common/enums/verification-status.enum';

export class VerifyServiceProviderDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  failureReason?: string;
}
