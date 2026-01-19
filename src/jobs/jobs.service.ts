import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/users.service';

import { ServiceProviderJob } from './entities/service-provider-job.entity';
import { RequestedService } from './entities/requested-service.entity';
import { Offer } from './entities/offer.entity';

import { RequestStatus } from 'src/common/enums/request-status.enum';
import { OfferStatus } from 'src/common/enums/offer-status.enum';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(ServiceProviderJob)
    private readonly jobRepo: Repository<ServiceProviderJob>,

    @InjectRepository(RequestedService)
    private readonly requestRepo: Repository<RequestedService>,

    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,

    private readonly usersService: UsersService,
  ) {}

  /* ----------------------------------------
   * Service Provider Jobs
   * -------------------------------------- */

  async createProviderJob(
    userId: string,
    data: Partial<ServiceProviderJob>,
  ): Promise<ServiceProviderJob> {
    const provider = await this.usersService.assertServiceProvider(userId);

    const job = this.jobRepo.create({
      ...data,
      serviceProvider: provider,
      isActive: false,
    });

    return this.jobRepo.save(job);
  }

  async activateJob(
    userId: string,
    jobId: string,
  ): Promise<ServiceProviderJob> {
    const provider = await this.usersService.assertServiceProvider(userId);

    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['serviceProvider'],
    });

    if (!job) throw new NotFoundException('Job not found');

    if (job.serviceProvider.id !== provider.id) {
      throw new ForbiddenException('Not your job');
    }

    job.isActive = true;
    return this.jobRepo.save(job);
  }

  async updateJob(
    userId: string,
    jobId: string,
    updates: Partial<ServiceProviderJob>,
  ): Promise<ServiceProviderJob> {
    const provider = await this.usersService.assertServiceProvider(userId);

    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['serviceProvider'],
    });

    if (!job) throw new NotFoundException('Job not found');

    if (job.serviceProvider.id !== provider.id) {
      throw new ForbiddenException('Not your job');
    }

    Object.assign(job, updates);
    return this.jobRepo.save(job);
  }

  /* ----------------------------------------
   * Requested Services
   * -------------------------------------- */

  async requestService(
    userId: string,
    jobId: string,
    payload: {
      description?: string;
      date?: Date;
      //   time?: string;
      location?: RequestedService['location'];
      isInstant?: boolean;
    },
  ): Promise<RequestedService> {
    const client = await this.usersService.assertClient(userId);

    const job = await this.jobRepo.findOne({
      where: { id: jobId, isActive: true },
      relations: ['serviceProvider'],
    });

    if (!job) {
      throw new BadRequestException('Job not available');
    }

    const request = this.requestRepo.create({
      job: job,
      client,
      description: payload.description,
      date: payload.date,
      //   time: payload.time,
      location: payload.location,
      isInstant: payload.isInstant ?? false,
      status: RequestStatus.PENDING,
    });

    return this.requestRepo.save(request);
  }

  async updateRequestStatus(
    providerUserId: string,
    requestId: string,
    status: RequestStatus,
  ): Promise<RequestedService> {
    const provider =
      await this.usersService.assertServiceProvider(providerUserId);

    const request = await this.requestRepo.findOne({
      where: { id: requestId },
      relations: ['serviceProviderJob', 'serviceProviderJob.serviceProvider'],
    });

    if (!request) throw new NotFoundException('Request not found');

    if (request.job.serviceProvider.id !== provider.id) {
      throw new ForbiddenException('Not authorized');
    }

    const allowedTransitions = {
      [RequestStatus.PENDING]: [RequestStatus.ACCEPTED, RequestStatus.REJECTED],
      [RequestStatus.ACCEPTED]: [
        RequestStatus.ON_GOING,
        RequestStatus.CANCELED,
      ],
      [RequestStatus.ON_GOING]: [RequestStatus.COMPLETED],
    };

    if (!allowedTransitions[request.status]?.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${request.status} to ${status}`,
      );
    }

    request.status = status;
    return this.requestRepo.save(request);
  }

  async cancelRequest(
    userId: string,
    requestId: string,
    reason?: string,
  ): Promise<RequestedService> {
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
      relations: ['client', 'client.profile', 'client.profile.user'],
    });

    if (!request) throw new NotFoundException('Request not found');

    if (request.client.profile.user.id !== userId) {
      throw new ForbiddenException('Not your request');
    }

    request.status = RequestStatus.CANCELED;
    request.cancellationReason = reason;

    return this.requestRepo.save(request);
  }

  /* ----------------------------------------
   * Offers
   * -------------------------------------- */

  async createOffer(userId: string, data: Partial<Offer>): Promise<Offer> {
    const client = await this.usersService.assertClient(userId);

    const offer = this.offerRepo.create({
      ...data,
      client,
      status: OfferStatus.PENDING,
    });

    return this.offerRepo.save(offer);
  }

  async respondToOffer(
    providerUserId: string,
    offerId: string,
    status: OfferStatus.ACCEPTED | OfferStatus.DECLINED,
  ): Promise<Offer> {
    const provider =
      await this.usersService.assertServiceProvider(providerUserId);

    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
      relations: ['serviceProvider'],
    });

    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.serviceProvider.id !== provider.id) {
      throw new ForbiddenException('Not authorized');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Offer already processed');
    }

    offer.status = status;
    return this.offerRepo.save(offer);
  }

  /* ----------------------------------------
   * Read / Assertion Methods (SAFE)
   * -------------------------------------- */

  /**
   * Used by ReviewService
   * Ensures:
   * - Request exists
   * - Status is COMPLETED
   * - Client owns the request
   */
  async getCompletedRequestForReview(
    requestedServiceId: string,
    clientUserId: string,
  ): Promise<RequestedService> {
    const request = await this.requestRepo.findOne({
      where: { id: requestedServiceId },
      relations: [
        'client',
        'client.profile',
        'client.profile.user',
        'serviceProviderJob',
        'serviceProviderJob.serviceProvider',
      ],
    });

    if (!request) {
      throw new NotFoundException('Requested service not found');
    }

    if (request.status !== RequestStatus.COMPLETED) {
      throw new BadRequestException('Service not completed');
    }

    if (request.client.profile.user.id !== clientUserId) {
      throw new ForbiddenException('Not your service request');
    }

    return request;
  }

  /**
   * Used by providers to validate ownership
   */
  async getRequestByIdForProvider(
    requestId: string,
    providerId: string,
  ): Promise<RequestedService> {
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
      relations: ['job', 'job.serviceProvider'],
    });

    if (!request) {
      throw new NotFoundException('Requested service not found');
    }

    if (request.job.serviceProvider.id !== providerId) {
      throw new ForbiddenException('Not authorized');
    }

    return request;
  }

  /**
   * Used by clients
   */
  async getRequestByIdForClient(
    requestId: string,
    clientId: string,
  ): Promise<RequestedService> {
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
      relations: ['client'],
    });

    if (!request) {
      throw new NotFoundException('Requested service not found');
    }

    if (request.client.id !== clientId) {
      throw new ForbiddenException('Not your request');
    }

    return request;
  }

  /**
   * Lightweight assertion for reuse
   */
  assertRequestCompleted(request: RequestedService): void {
    if (request.status !== RequestStatus.COMPLETED) {
      throw new BadRequestException('Service not completed');
    }
  }
}
