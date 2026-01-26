import { IsEnum, IsBoolean, IsString } from 'class-validator';
import { ReviewStars } from 'src/common/enums/review-stars.enum';

export class CreateReviewDto {
  @IsString()
  requestedServiceId: string;

  @IsEnum(ReviewStars)
  stars: ReviewStars;

  @IsString()
  comment: string;

  @IsBoolean()
  chargedMore: boolean;

  @IsBoolean()
  timely: boolean;

  @IsBoolean()
  wasProfessional: boolean;

  @IsBoolean()
  wasSuspicious: boolean;
}
