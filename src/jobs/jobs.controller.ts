import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { CreateJobDto } from './dto/create-job.dto';
import { RequestServiceDto } from './dto/request-service.dto';
import { RequestStatus } from 'src/common/enums/request-status.enum';
import { Response } from 'src/common/utils/response';
import { RescheduleDto } from './dto/reschedule.dto';
import { RescheduledStatus } from 'src/common/enums/rescheduled-status.enum';
import { ServiceRequestsService } from './service-requests.service';
import { OffersService } from './offers.service';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateOfferStatusDto } from './dto/update-offer-status.dto';
import { SubscriptionGuard } from 'src/subscriptions/guards/subscription.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly offersService: OffersService,
    private readonly requestsService: ServiceRequestsService,
  ) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  createJob(@CurrentUser() user, @Body() dto: CreateJobDto) {
    return this.jobsService.createProviderJob(user.id, dto);
  }

  @Get()
  getJobs(@CurrentUser() user) {
    return this.jobsService.getJobBySpId(user.id);
  }

  @Patch(':id/activate')
  @UseGuards(SubscriptionGuard)
  activateJob(@CurrentUser() user, @Param('id') jobId: string) {
    return this.jobsService.activateDeactivateJob(user.id, jobId, 'activate');
  }

  @Patch(':id/deactivate')
  @UseGuards(SubscriptionGuard)
  deactivateJob(@CurrentUser() user, @Param('id') jobId: string) {
    return this.jobsService.activateDeactivateJob(user.id, jobId, 'deactivate');
  }

  @Post('/request')
  requestService(@CurrentUser() user, @Body() dto: RequestServiceDto) {
    return this.requestsService.requestService(user.id, dto);
  }

  @Post('/request/:id/accept')
  async acceptRequest(@CurrentUser() user, @Param('id') requestId: string) {
    await this.requestsService.updateRequestStatus(
      user.id,
      requestId,
      RequestStatus.ACCEPTED,
    );

    return new Response('Job accepted Successfully');
  }

  @Post('/request/:id/reject')
  async rejectRequest(@CurrentUser() user, @Param('id') requestId: string) {
    await this.requestsService.updateRequestStatus(
      user.id,
      requestId,
      RequestStatus.REJECTED,
    );

    return new Response('Job rejected Successfully');
  }

  @Post('/request/:id/reschedule')
  async rescheduleRequest(
    @CurrentUser() user,
    @Param('id') requestId: string,
    @Body() rescheduleDto: RescheduleDto,
  ) {
    const rescheduleRequest = await this.requestsService.rescheduleRequest(
      user.id,
      requestId,
      rescheduleDto,
    );

    return new Response('Reschedule request sent', rescheduleRequest);
  }

  @Get('/request/service-provider')
  async getServiceProviderRequests(
    @CurrentUser() user,
    @Param('status') state: string,
  ) {
    const requests = await this.requestsService.findByServiceProviderId(
      user.id,
    );

    return new Response('Success', requests);
  }

  @Get('/request/client')
  async getClientRequests(@CurrentUser() user, @Param('status') state: string) {
    const requests = await this.requestsService.getAllClientsRequest(user.id);

    return new Response('Success', requests);
  }

  @Post('/request/:id/reschedule/accept')
  async acceptRescheduleRequest(
    @CurrentUser() user,
    @Param('id') requestId: string,
  ) {
    const request = await this.requestsService.acceptOrRejectRescheduleRequest(
      user.id,
      requestId,
      RescheduledStatus.ACCEPTED,
    );

    return new Response('Successful', request);
  }

  @Post('/request/:id/reschedule/reject')
  async rejectRescheduleRequest(
    @CurrentUser() user,
    @Param('id') requestId: string,
  ) {
    const request = await this.requestsService.acceptOrRejectRescheduleRequest(
      user.id,
      requestId,
      RescheduledStatus.REJECTED,
    );

    return new Response('Successful', request);
  }

  /**
   * OFFERS
   */

  @Post('/offers')
  async createOffer(
    @CurrentUser() user: User,
    @Body() offerDto: CreateOfferDto,
  ): Promise<Response> {
    const response = await this.offersService.createOffer(user.id, offerDto);

    return new Response('success', response);
  }

  @Patch('/offers/:offerId/respond')
  @UseGuards(SubscriptionGuard)
  async respondToOffer(
    @CurrentUser() user: User,
    @Param('offerId') offerId: string,
    @Body() { status }: UpdateOfferStatusDto,
  ): Promise<Response> {
    const response = await this.offersService.respondToOffer(
      user.id,
      offerId,
      status,
    );

    return new Response('success', response);
  }

  @Post('/offers/:offerId/make-payment')
  async makeOfferPayment(
    @Req() req,
    @CurrentUser() user: User,
    @Param('offerId') offerId: string,
  ): Promise<Response> {
    return await this.offersService.makePayment(
      offerId,
      user.id,
      req.headers.authorization,
    );
  }
}
