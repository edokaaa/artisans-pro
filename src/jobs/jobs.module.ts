import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { RequestedService } from './entities/requested-service.entity';
import { ServiceProviderJob } from './entities/service-provider-job.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      RequestedService,
      ServiceProviderJob,
    ]),
    UsersModule,
  ],
  providers: [JobsService],
  exports: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
