import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
  createProfile(@CurrentUser() user: User, @Body() dto: CreateProfileDto) {
    return this.usersService.createProfile(user.id, dto.name, {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    });
  }

  @Post('client')
  createClient(@CurrentUser() user: User, @Body() dto: CreateClientDto) {
    return this.usersService.createClient(user.id, dto.fullName);
  }

  @Post('service-provider')
  createServiceProvider(
    @CurrentUser() user: User,
    @Body() dto: CreateServiceProviderDto,
  ) {
    return this.usersService.createServiceProvider(user.id, dto);
  }
}
