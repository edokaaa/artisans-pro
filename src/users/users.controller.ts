import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  ParseUUIDPipe,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { ServiceProvidersService } from './service-provider.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly serviceProviderService: ServiceProvidersService,
  ) {}

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

  @Get('service-provider/by-skill/:skillId')
  getBySkill(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Query() query: SearchProvidersDto,
  ) {
    return this.serviceProviderService.findBySkillId(skillId, query);
  }

  @Get('service-provider/by-category/:categoryId')
  getByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() query: SearchProvidersDto,
  ) {
    return this.serviceProviderService.findByCategoryId(categoryId, query);
  }

  @Get('service-provider/:id')
  getServiceProvider(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceProviderService.getById(id);
  }
}
