import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { ServiceProvider } from 'src/users/entities/service-provider.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,

    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(ServiceProvider)
    private readonly providerRepo: Repository<ServiceProvider>,
  ) {}

  async findAll() {
    return this.subscriptionRepo.find({
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    return this.subscriptionRepo.findOne({
      where: { id },
      relations: ['plan'],
    });
  }

  /* -----------------------------
   * Creation (before payment)
   * ----------------------------- */
  async createSubscription(providerUserId: string, planId: string) {
    const plan = await this.planRepo.findOne({
      where: { id: planId, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const serviceProvider = await this.providerRepo.findOne({
      where: { profile: { user: { id: providerUserId } } },
    });

    if (!serviceProvider) {
      throw new NotFoundException('Plan not found');
    }

    const subscription = this.subscriptionRepo.create({
      serviceProvider: { id: serviceProvider.id },
      plan: { id: plan.id },
      status: SubscriptionStatus.PENDING,
    });

    return this.subscriptionRepo.save(subscription);
  }

  /* -----------------------------
   * Activation (payment success)
   * ----------------------------- */
  async activateSubscription(subscriptionId: string, sessionId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      return subscription; // idempotent
    }

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setMonth(endsAt.getMonth() + 1);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.startsAt = now;
    subscription.endsAt = endsAt;
    subscription.paymentSessionId = sessionId;

    return this.subscriptionRepo.save(subscription);
  }

  /* -----------------------------
   * Enforcement
   * ----------------------------- */
  async getActiveSubscriptionForProvider(providerUserId: string) {
    return this.subscriptionRepo.findOne({
      where: {
        serviceProvider: { profile: { user: { id: providerUserId } } },
        status: SubscriptionStatus.ACTIVE,
      },
      order: { endsAt: 'DESC' },
      relations: ['plan'],
    });
  }

  async assertProviderHasActiveSubscription(serviceProviderId: string) {
    const sub = await this.getActiveSubscriptionForProvider(serviceProviderId);

    if (!sub || !sub.endsAt || sub.endsAt < new Date()) {
      throw new ForbiddenException('Active subscription required');
    }

    return sub;
  }

  /* -----------------------------
   * Expiry handling (cron/worker)
   * ----------------------------- */
  async expireSubscriptions() {
    await this.subscriptionRepo.update(
      {
        status: SubscriptionStatus.ACTIVE,
        endsAt: LessThan(new Date()),
      },
      { status: SubscriptionStatus.EXPIRED },
    );
  }

  /* -----------------------------
   * Admin override
   * ----------------------------- */
  async adminActivateSubscription(subscriptionId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setMonth(endsAt.getMonth() + 1);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.startsAt = now;
    subscription.endsAt = endsAt;

    return this.subscriptionRepo.save(subscription);
  }
}
