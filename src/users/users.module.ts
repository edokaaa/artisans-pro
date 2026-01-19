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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Client,
      Profile,
      ServiceProvider,
    ]),
    MessagingModule
  ],
  controllers: [UsersController],
  providers: [UserEventsConsumer, UsersService],
  exports: [UsersService]
})
export class UsersModule {}
