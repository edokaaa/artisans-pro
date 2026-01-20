import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async createProfile(
    @CurrentUser() user: User,
    @Body() dto: CreateProfileDto,
  ) {
    return await this.usersService.createProfile(user.id, dto.name, {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    });
  }

  @Post('client')
  @UseGuards(JwtAuthGuard)
  async createClient(@CurrentUser() user: User, @Body() dto: CreateClientDto) {
    // create profile
    await this.usersService.createProfile(user.id, dto.name, {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    });
    // create client
    return await this.usersService.createClient(user.id, dto.name);
  }

  @Post('service-provider')
  @UseGuards(JwtAuthGuard)
  async createServiceProvider(
    @CurrentUser() user: User,
    @Body() dto: CreateServiceProviderDto,
  ) {
    // create profile
    await this.usersService.createProfile(user.id, dto.name, {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    });
    // create service provider
    return await this.usersService.createServiceProvider(user.id, dto);
  }

  @Post('create-demo-user')
  async createDemoUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createDemoUser(createUserDto);
    return user;
  }
}
