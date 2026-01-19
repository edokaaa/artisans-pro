import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagingModule } from './messaging/messaging.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    DatabaseModule,
    CategoriesModule,
    ReviewsModule,
    UsersModule,
    CommonModule,
    JobsModule,
    MessagingModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
