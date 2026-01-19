import { IsEnum } from 'class-validator';
import { OfferStatus } from 'src/common/enums/offer-status.enum';

export class UpdateOfferStatusDto {
  @IsEnum(OfferStatus)
  status: OfferStatus;
}
