import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from 'src/messaging/messaging.module';
import { User } from './entities/user.entity';
import { UserEventsConsumer } from './consumers/user-events.consumer';
import { Client } from './entities/client.entity';
import { Profile } from './entities/profile.entity';
import { ServiceProvider } from './entities/service-provider.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ServiceProvidersService } from './service-provider.service';
import { ServiceCategorySkill } from 'src/categories/entities/service-category-skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Client,
      Profile,
      ServiceProvider,
      ServiceCategorySkill,
    ]),
    MessagingModule,
  ],
  controllers: [UsersController],
  providers: [
    UserEventsConsumer,
    UsersService,
    ServiceProvidersService,
  ],
  exports: [UsersService, ServiceProvidersService],
})
export class UsersModule {}
