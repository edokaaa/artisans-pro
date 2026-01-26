import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Escrow } from './entities/escrow.entity';
import { PaymentEventsConsumer } from './consumers/payment-events.consumer';
import { MessagingModule } from 'src/messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Escrow]),
    HttpModule,
    MessagingModule,
  ],
  providers: [PaymentEventsConsumer, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
