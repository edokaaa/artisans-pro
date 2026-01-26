import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Payment,
  PaymentPurpose,
  PaymentStatus,
} from '../entities/payment.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { PaymentsService } from '../payments.service';
import { RabbitMQService } from 'src/messaging/rabbitmq.service';
import {
  PaymentEventPayload,
  PaymentEventSession,
  PaymentPayload,
} from '../interfaces/payment-event.interface';
import { Offer } from 'src/jobs/entities/offer.entity';
import { OfferStatus } from 'src/common/enums/offer-status.enum';

@Injectable()
export class PaymentEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentEventsConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly dataSource: DataSource,
    private readonly subscriptionService: SubscriptionsService,
    private readonly paymentService: PaymentsService,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitMQService.connect();

    const exchange = process.env.RABBITMQ_EXCHANGE;
    const queue = process.env.RABBITMQ_QUEUE;
    const routingKeys = [
      'payment.debit.proservice.subscription',
      'payment.debit.proservice.offer',
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
      const routingKey = msg.fields.routingKey;
      const eventSession: PaymentEventSession = JSON.parse(
        msg.content.toString(),
      );

      if (!eventSession?.session.id) {
        throw new Error('Invalid payment event payload');
      }

      if (routingKey === 'payment.debit.proservice.subscription') {
        await this.handleSubscriptionDebit(eventSession.session);
      } else {
        await this.handleOfferDebit(eventSession.session);
      }

      channel.ack(msg);
    } catch (error) {
      this.logger.error('Failed to process payment event', error.stack);
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
      id: session_id,
      user_id,
      amount,
      reference,
      payload,
    }: PaymentEventPayload,
    purpose: PaymentPurpose,
  ) {
    this.logger.log(`Processing new payment of type ${purpose}`);
    const paymentRepo = this.dataSource.getRepository(Payment);

    // 🔁 Idempotency check
    const existing = await paymentRepo.findOne({
      where: { sessionId: session_id },
    });

    if (existing) {
      this.logger.warn(`Duplicate payment event: ${session_id}`);
      return;
    }
    const jsonPayload: PaymentPayload = JSON.parse(payload);

    try {
      const payment = paymentRepo.create({
        sessionId: session_id,
        userId: user_id,
        amount,
        purpose,
        status: PaymentStatus.SUCCESS,
        reference,
        payload: jsonPayload,
      });

      await paymentRepo.save(payment);

      // Persist transaction in payment service
      const narration =
        purpose === PaymentPurpose.SUBSCRIPTION
          ? `Payment for proservice ${jsonPayload.subscriptionPlanName} subscription`
          : `Payment for proservice ${jsonPayload.offerName}`;

      await this.paymentService.createTransactionRecord({
        user_id,
        transaction_type: 'proservice',
        amount,
        paid_amount: amount,
        status: 'success',
        narration,
        reference,
      });
    } catch (error) {
      // reverse debit
      await this.paymentService.reverseDebit(session_id);

      // if payment created, update status to failed
      const payment = await paymentRepo.findOne({
        where: { sessionId: session_id },
      });

      if (payment) {
        payment.status = PaymentStatus.REVERSED;
        await paymentRepo.save(payment);
      }
      return;
    }

    // Domain-specific side effects
    if (purpose === PaymentPurpose.SUBSCRIPTION && jsonPayload.subscriptionId) {
      await this.subscriptionService.activateSubscription(
        jsonPayload.subscriptionId,
        session_id,
      );
    }

    if (purpose === PaymentPurpose.OFFER && jsonPayload.offerId) {
      await this.markOfferAsPaid(jsonPayload.offerId, false);
    }
  }
  /* -----------------------------
   * Payment success handler
   * (called by RabbitMQ consumer)
   * ----------------------------- */
  private async markOfferAsPaid(offerId: string, useEscrow: boolean) {
    const offerRepo = this.dataSource.getRepository(Offer);
    const offer = await offerRepo.findOne({ where: { id: offerId } });

    if (!offer) {
      this.logger.error('Invalid offer');
      return;
    }

    if (offer.status === OfferStatus.PAYMENT_MADE) {
      return offer; // idempotent
    }

    offer.status = OfferStatus.PAYMENT_MADE;
    offer.useEscrow = useEscrow;

    if (useEscrow) {
      offer.escrowStatus = 'held';
    }
    await offerRepo.save(offer);
  }
}
