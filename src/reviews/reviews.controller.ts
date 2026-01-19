import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  createReview(@CurrentUser() user, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(user.id, dto);
  }
}
