import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { CreateJobDto } from './dto/create-job.dto';
import { RequestServiceDto } from './dto/request-service.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  createJob(@CurrentUser() user, @Body() dto: CreateJobDto) {
    return this.jobsService.createProviderJob(user.id, dto);
  }

  @Get()
  getJobs(@CurrentUser() user) {
    return this.jobsService.getJobBySpId(user.id);
  }

  @Patch(':id/activate')
  activateJob(@CurrentUser() user, @Param('id') jobId: string) {
    return this.jobsService.activateDeactivateJob(user.id, jobId, 'activate');
  }

  @Patch(':id/deactivate')
  deactivateJob(@CurrentUser() user, @Param('id') jobId: string) {
    return this.jobsService.activateDeactivateJob(user.id, jobId, 'deactivate');
  }

  @Post('/request')
  requestService(
    @CurrentUser() user,
    @Body() dto: RequestServiceDto,
  ) {
    return this.jobsService.requestService(user.id, dto);
  }
}
