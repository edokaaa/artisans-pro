import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/users.service';

import { Review } from './entities/review.entity';
import { ReviewReply } from './entities/review-reply.entity';

import { ServiceRequestsService } from 'src/jobs/service-requests.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(ReviewReply)
    private readonly replyRepo: Repository<ReviewReply>,

    private readonly usersService: UsersService,
    private readonly requestsService: ServiceRequestsService,
  ) {}

  /* ----------------------------------------
   * Reviews
   * -------------------------------------- */

  async createReview(
    userId: string,
    payload: {
      requestedServiceId: string;
      stars: 1 | 2 | 3 | 4 | 5;
      comment?: string;
      chargedMore: boolean;
      timely: boolean;
      wasProfessional: boolean;
      wasSuspicious: boolean;
      anonymous?: boolean;
    },
  ): Promise<Review> {
    const client = await this.usersService.assertClient(userId);

    const request = await this.requestsService.getCompletedRequestForReview(
      payload.requestedServiceId,
      userId,
    );

    const existingReview = await this.reviewRepo.findOne({
      where: { requestedService: { id: request.id } },
    });

    if (existingReview) {
      throw new BadRequestException('Review already submitted');
    }

    const review = this.reviewRepo.create({
      stars: payload.stars,
      comment: payload.comment,
      chargedMore: payload.chargedMore,
      timely: payload.timely,
      wasProfessional: payload.wasProfessional,
      wasSuspicious: payload.wasSuspicious,
      client: payload.anonymous ? null : client,
      serviceProvider: request.job.serviceProvider,
      requestedService: request,
    });

    return this.reviewRepo.save(review);
  }

  /* ----------------------------------------
   * Review Replies
   * -------------------------------------- */

  async replyToReview(
    providerUserId: string,
    reviewId: string,
    comment: string,
  ): Promise<ReviewReply> {
    const provider =
      await this.usersService.assertServiceProvider(providerUserId);

    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['serviceProvider'],
    });

    if (!review) throw new NotFoundException('Review not found');

    if (review.serviceProvider.id !== provider.id) {
      throw new ForbiddenException('Not your review');
    }

    const existingReply = await this.replyRepo.findOne({
      where: { review: { id: review.id } },
    });

    if (existingReply) {
      throw new BadRequestException('Reply already exists');
    }

    const reply = this.replyRepo.create({
      review,
      comment,
    });

    return this.replyRepo.save(reply);
  }

  /* ----------------------------------------
   * Queries
   * -------------------------------------- */

  async getReviewsForProvider(serviceProviderId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { serviceProvider: { id: serviceProviderId } },
      relations: ['client', 'reply'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReviewByRequest(requestedServiceId: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { requestedService: { id: requestedServiceId } },
      relations: ['reply'],
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
