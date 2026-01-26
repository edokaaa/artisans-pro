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
import { ServiceCategorySkill } from 'src/categories/entities/service-category-skill.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { ServiceProvidersService } from 'src/users/service-provider.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(ServiceProviderJob)
    private readonly jobRepo: Repository<ServiceProviderJob>,

    private readonly usersService: UsersService,

    private readonly serviceProviderService: ServiceProvidersService,

    @InjectRepository(ServiceCategorySkill)
    private readonly skillRepo: Repository<ServiceCategorySkill>,
  ) {}

  async createProviderJob(
    userId: string,
    data: CreateJobDto,
  ): Promise<ServiceProviderJob> {
    const provider = await this.usersService.assertServiceProvider(userId);

    const skill = await this.skillRepo.findOne({ where: { id: data.skillId } });

    if (!skill) {
      throw new BadRequestException('Skill not found');
    }
    const job = this.jobRepo.create({
      ...data,
      skill,
      serviceProvider: provider,
      isActive: false,
    });

    return this.jobRepo.save(job);
  }

  async activateDeactivateJob(
    userId: string,
    jobId: string,
    action: 'activate' | 'deactivate',
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

    job.isActive = action === 'activate';
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

  async getJobBySpId(userId: string) {
    const provider = await this.usersService.assertServiceProvider(userId);
    const providerWithJobs = await this.serviceProviderService.getWithJobs(
      provider.id,
    );
    return providerWithJobs?.jobs;
  }
}
