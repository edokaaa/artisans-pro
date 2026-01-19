import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async connect(): Promise<amqp.Channel> {
    if (this.channel) return this.channel;

    const url = this.configService.get<string>('RABBITMQ_URL');
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    return this.channel;
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
