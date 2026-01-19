import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewService } from './reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  createReview(@CurrentUser() user, @Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(user.id, dto);
  }
}
