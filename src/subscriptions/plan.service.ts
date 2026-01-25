import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async create(dto: any) {
    return this.planRepo.save(dto);
  }

  async findAll() {
    return this.planRepo.find();
  }

  async update(id: string, dto: any) {
    await this.planRepo.update(id, dto);
    return this.planRepo.findOne({ where: { id } });
  }

  async deactivate(id: string) {
    await this.planRepo.update(id, { isActive: false });
    return this.planRepo.findOne({ where: { id } });
  }
}
