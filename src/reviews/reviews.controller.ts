import { Controller, Post, Body, UseGuards, Param, Get } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewReplyDto } from './dto/review-reply.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { Response } from 'src/common/utils/response';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(@CurrentUser() user, @Body() dto: CreateReviewDto) {
    return await this.reviewsService.createReview(user.id, dto);
  }

  @Post('/:reviewId/reply')
  async replyReview(
    @CurrentUser() user,
    @Param('reviewId') reviewId: string,
    @Body() { comment }: ReviewReplyDto,
  ) {
    const response = await this.reviewsService.replyToReview(
      user.id,
      reviewId,
      comment,
    );

    return new Response('success', response);
  }

  @Post('/reports/service-provider')
  async report(@CurrentUser() user, @Body() data: CreateReportDto) {
    const response = await this.reviewsService.reportServiceProvider(
      user.id,
      data,
    );

    return new Response('success', response);
  }

  @Get('/:serviceProviderId')
  async getServiceProviderReviews(
    @Param('serviceProviderId') serviceProviderId: string,
  ) {
    const response =
      await this.reviewsService.getReviewsForProvider(serviceProviderId);

    return new Response('success', response);
  }

  @Get('/reports/service-provider/:serviceProviderId')
  async getServiceProviderReports(
    @Param('serviceProviderId') serviceProviderId: string,
  ) {
    const response =
      await this.reviewsService.getServiceProviderReports(serviceProviderId);

    return new Response('success', response);
  }
}
