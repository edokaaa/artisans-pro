import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Payment,
  PaymentPurpose,
  PaymentStatus,
} from '../entities/payment.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { OffersService } from 'src/jobs/offers.service';
import { PaymentsService } from '../payments.service';
import { RabbitMQService } from 'src/messaging/rabbitmq.service';
import { PaymentEventPayload } from '../interfaces/payment-event.interface';

@Injectable()
export class PaymentEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentEventsConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly dataSource: DataSource,
    private readonly subscriptionService: SubscriptionsService,
    private readonly offersService: OffersService,
    private readonly paymentService: PaymentsService,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitMQService.connect();

    const exchange = process.env.RABBITMQ_EXCHANGE;
    const queue = process.env.RABBITMQ_QUEUE;
    const routingKeys = [
      'payment.debit.proservice.subscription',
      'payment.debit.proservice.subscription',
    ];

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });

    for (const key of routingKeys) {
      await channel.bindQueue(queue, exchange, key);
    }

    channel.consume(queue, (msg) => this.handleMessage(msg, channel), {
      noAck: false,
    });

    this.logger.log('Payment events consumer started');
  }

  private async handleMessage(msg: any, channel: any) {
    try {
      this.logger.log(msg);
      const routingKey = msg.fields.routingKey;
      const payload: PaymentEventPayload = JSON.parse(msg.content.toString());

      if (!payload?.session_id) {
        throw new Error('Invalid payment event payload');
      }

      if (routingKey === 'payment.debit.proservice.subscription') {
        await this.handleSubscriptionDebit(payload);
      } else {
        await this.handleOfferDebit(payload);
      }

      channel.ack(msg);
    } catch (error) {
      this.logger.error('Failed to process user event', error.stack);
    }
  }
  async handleSubscriptionDebit(payload: PaymentEventPayload) {
    await this.processPayment(payload, PaymentPurpose.SUBSCRIPTION);
  }

  async handleOfferDebit(payload: PaymentEventPayload) {
    await this.processPayment(payload, PaymentPurpose.OFFER);
  }

  private async processPayment(
    {
      session_id,
      user_id,
      amount,
      status,
      reference,
      payload,
    }: PaymentEventPayload,
    purpose: PaymentPurpose,
  ) {
    const paymentRepo = this.dataSource.getRepository(Payment);

    // 🔁 Idempotency check
    const existing = await paymentRepo.findOne({
      where: { sessionId: session_id },
    });

    if (existing) {
      this.logger.warn(`Duplicate payment event: ${session_id}`);
      return;
    }

    const payment = paymentRepo.create({
      sessionId: session_id,
      userId: user_id,
      amount,
      purpose,
      status:
        status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      reference,
      payload,
    });

    await paymentRepo.save(payment);

    if (status !== 'success') {
      await this.paymentService.reverseDebit(session_id);
      return;
    }

    // Persist transaction in payment service
    await this.paymentService.createTransactionRecord({
      user_id,
      transaction_type: purpose,
      amount,
      status: 'success',
      narration: `${purpose} payment`,
      reference,
    });

    // Domain-specific side effects
    if (purpose === PaymentPurpose.SUBSCRIPTION) {
      await this.subscriptionService.activateSubscription(
        payload.subscriptionId,
        session_id,
      );
    }

    if (purpose === PaymentPurpose.OFFER) {
      await this.offersService.markOfferAsPaid(
        payload.offerId,
        payload.useEscrow,
      );
    }
  }
}
