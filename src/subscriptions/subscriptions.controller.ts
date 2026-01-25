import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Response } from 'src/common/utils/response';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateSubscriptionDto) {
    const response = await this.subscriptionService.createSubscription(
      user.id,
      dto.planId,
    );

    return new Response('success', response);
  }

  @Get('me')
  async mySubscription(@CurrentUser() user: User) {
    const response = await this.subscriptionService.getActiveSubscriptionForProvider(
      user.id,
    );
    return new Response('success', response);
  }

}
