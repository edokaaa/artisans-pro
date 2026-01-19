// users/consumers/user-events.consumer.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RabbitMQService } from 'src/messaging/rabbitmq.service';
import { User } from '../entities/user.entity';
import { UserEventPayload } from '../interfaces/user-event.interface';

@Injectable()
export class UserEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserEventsConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitMQService.connect();

    const exchange = 'user_service_exchange';
    const queue = 'user_service_queue';
    const routingKeys = ['user.created', 'user.updated'];

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });

    for (const key of routingKeys) {
      await channel.bindQueue(queue, exchange, key);
    }

    channel.consume(queue, (msg) => this.handleMessage(msg, channel), {
      noAck: false,
    });

    this.logger.log('User events consumer started');
  }

  private async handleMessage(msg: any, channel: any) {
    try {
      const routingKey = msg.fields.routingKey;
      const payload: UserEventPayload = JSON.parse(msg.content.toString());

      if (!payload?.id) {
        throw new Error('Invalid user event payload');
      }

      await this.upsertUser(payload);

      channel.ack(msg);
    } catch (error) {
      this.logger.error('Failed to process user event', error.stack);

      /**
       * IMPORTANT:
       * - nack(false, false) sends to DLQ if configured
       * - prevents poison message infinite loops
       */
      channel.nack(msg, false, false);
    }
  }

  private async upsertUser(payload: UserEventPayload) {
    const repo = this.dataSource.getRepository(User);

    await repo.save({
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      lastSyncedAt: new Date(payload.updatedAt),
    });
  }
}
