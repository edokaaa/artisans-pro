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

import { RequestStatus } from 'src/common/enums/request-status.enum';
import { RescheduleDto } from './dto/reschedule.dto';
import { RescheduledStatus } from 'src/common/enums/rescheduled-status.enum';

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectRepository(ServiceProviderJob)
    private readonly jobRepo: Repository<ServiceProviderJob>,

    @InjectRepository(RequestedService)
    private readonly requestRepo: Repository<RequestedService>,

    private readonly usersService: UsersService,
  ) {}

  async requestService(
    userId: string,
    payload: {
      jobId: string;
      description?: string;
      date?: Date;
      //   time?: string;
      location?: RequestedService['location'];
      city: string;
      state: string;
      isInstant?: boolean;
    },
  ): Promise<RequestedService> {
    const client = await this.usersService.assertClient(userId);

    const job = await this.jobRepo.findOne({
      where: { id: payload.jobId, isActive: true },
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
      city: payload.city,
      state: payload.state,
      isInstant: payload.isInstant ?? false,
      status: RequestStatus.PENDING,
    });

    return this.requestRepo.save(request);
    // TODO: Activity (new request)
  }

  async rescheduleRequest(
    providerUserId: string,
    requestId: string,
    rescheduleDto: RescheduleDto,
  ): Promise<RequestedService> {
    const request = await this.getProviderRequest(providerUserId, requestId);
    request.isRescheduled = true;
    request.rescheduledDate = rescheduleDto.rescheduledDateTime;
    request.rescheduledReason = rescheduleDto.reason;
    request.rescheduledstatus = RescheduledStatus.REQUESTED;
    this.requestRepo.save(request);
    // TODO: Activity (rescheduled request)
    return request;
  }

  async acceptOrRejectRescheduleRequest(
    clientUserId: string,
    requestId: string,
    status: RescheduledStatus,
  ): Promise<RequestedService> {
    const request = await this.getClientsRequest(clientUserId, requestId);

    request.rescheduledstatus = status;
    request.status = RequestStatus.CANCELED;
    request.cancellationReason = 'reschedule rejected';
    this.requestRepo.save(request);

    // TODO: Activity (canceled request)
    return request;
  }

  async getAllClientsRequest(
    clientUserId: string,
  ): Promise<RequestedService[]> {
    const client = await this.usersService.assertClient(clientUserId);

    const requests = await this.requestRepo.find({
      where: { client: { id: client.id } },
    });

    return requests;
  }

  async getClientsRequest(
    clientUserId: string,
    requestId: string,
  ): Promise<RequestedService> {
    const client = await this.usersService.assertClient(clientUserId);

    if (!client) throw new NotFoundException('Client profile not found');

    const request = await this.requestRepo.findOne({
      where: { id: requestId },
      relations: ['client'],
    });
    if (!request) throw new NotFoundException('Request not found');

    if (request.client.id !== client.id) {
      throw new ForbiddenException('Not authorized');
    }

    return request;
  }

  private async getProviderRequest(
    providerUserId: string,
    requestId: string,
  ): Promise<RequestedService> {
    const provider =
      await this.usersService.assertServiceProvider(providerUserId);

    const request = await this.requestRepo.findOne({
      where: { id: requestId },
      relations: ['job', 'job.serviceProvider'],
    });

    if (!request) throw new NotFoundException('Request not found');

    if (request.job.serviceProvider.id !== provider.id) {
      throw new ForbiddenException('Not authorized');
    }

    return request;
  }

  async updateRequestStatus(
    providerUserId: string,
    requestId: string,
    status: RequestStatus,
  ): Promise<RequestedService> {
    const request = await this.getProviderRequest(providerUserId, requestId);

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

  /**
   * Service Provider Requested Services
   */
  async findByServiceProviderId(
    userId: string,
    filters?: {
      status?: RequestStatus;
    },
  ) {
    const provider = await this.usersService.assertServiceProvider(userId);
    const qb = this.requestRepo
      .createQueryBuilder('request')
      .innerJoinAndSelect('request.job', 'job')
      .innerJoin('job.serviceProvider', 'provider')
      .innerJoinAndSelect('request.client', 'client')
      .where('provider.id = :providerId', { providerId: provider.id });

    if (filters?.status) {
      qb.andWhere('request.status = :status', {
        status: filters.status,
      });
    }

    return qb.orderBy('request.createdAt', 'DESC').getMany();
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
        'job',
        'job.serviceProvider',
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
