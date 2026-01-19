import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from 'src/messaging/messaging.module';
import { User } from './entities/user.entity';
import { UserEventsConsumer } from './consumers/user-events.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MessagingModule,
  ],
  providers: [UserEventsConsumer],
})
export class UsersModule {}
