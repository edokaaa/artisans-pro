import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
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

  @Patch(':id/activate')
  activateJob(@CurrentUser() user, @Param('id') jobId: string) {
    return this.jobsService.activateJob(user.id, jobId);
  }

  @Post(':id/request')
  requestService(
    @CurrentUser() user,
    @Param('id') jobId: string,
    @Body() dto: RequestServiceDto,
  ) {
    return this.jobsService.requestService(user.id, jobId, dto);
  }
}
