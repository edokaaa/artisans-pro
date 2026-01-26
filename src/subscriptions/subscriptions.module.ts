import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { ServiceProvider } from 'src/users/entities/service-provider.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { PlanService } from './plan.service';
import { AdminPlansController } from './admin-plans.controller';
import { PaymentsModule } from 'src/payments/payments.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionPlan, ServiceProvider]),
    PaymentsModule,
    UsersModule,
  ],
  controllers: [
    SubscriptionsController,
    AdminSubscriptionsController,
    AdminPlansController,
  ],
  providers: [SubscriptionsService, PlanService],
  exports: [SubscriptionsService, PlanService],
})
export class SubscriptionsModule {}
