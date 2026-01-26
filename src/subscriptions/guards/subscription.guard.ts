import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Admin bypass
    if (user?.role === 'admin') return true;

    if (!user?.serviceProviderId) {
      throw new ForbiddenException('Service provider only');
    }

    await this.subscriptionService.assertProviderHasActiveSubscription(
      user.serviceProviderId,
    );

    return true;
  }
}
