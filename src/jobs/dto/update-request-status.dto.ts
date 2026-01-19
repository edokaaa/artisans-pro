import { IsEnum, IsOptional } from 'class-validator';
import { RequestStatus } from 'src/common/enums/request-status.enum';

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  cancellationReason?: string;
}
