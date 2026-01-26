import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { RequestedService } from './entities/requested-service.entity';
import { ServiceProviderJob } from './entities/service-provider-job.entity';
import { UsersModule } from 'src/users/users.module';
import { ServiceCategorySkill } from 'src/categories/entities/service-category-skill.entity';
import { OffersService } from './offers.service';
import { ServiceRequestsService } from './service-requests.service';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      RequestedService,
      ServiceProviderJob,
      ServiceCategorySkill,
    ]),
    UsersModule,
    SubscriptionsModule,
    PaymentsModule,
  ],
  providers: [JobsService, OffersService, ServiceRequestsService],
  exports: [JobsService, OffersService, ServiceRequestsService],
  controllers: [JobsController],
})
export class JobsModule {}
