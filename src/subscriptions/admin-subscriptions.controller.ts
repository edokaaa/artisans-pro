import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SubscriptionsService } from './subscriptions.service';
import { Response } from 'src/common/utils/response';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard) // Add Role Guard
// @Roles('admin')
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Get()
  async findAll() {
    const response = await this.subscriptionService.findAll();

    return new Response('success', response);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await this.subscriptionService.findById(id);

    return new Response('success', response);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const response =
      await this.subscriptionService.adminActivateSubscription(id);

    return new Response('success', response);
  }
}
