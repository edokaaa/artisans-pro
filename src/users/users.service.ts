import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Client } from './entities/client.entity';
import { ServiceProvider } from './entities/service-provider.entity';

import { VerificationStatus } from 'src/common/enums/verification-status.enum';
import { Role } from 'src/common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(ServiceProvider)
    private readonly providerRepo: Repository<ServiceProvider>,
  ) {}

  /* -----------------------------------------
   * User Snapshot (Read-only)
   * --------------------------------------- */

  async getUserSnapshot(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /* -----------------------------------------
   * Profile
   * --------------------------------------- */

  async createProfile(
    userId: string,
    name: string,
    location?: Profile['location'],
  ) {
    const user = await this.getUserSnapshot(userId);

    const existing = await this.profileRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (existing) {
      throw new BadRequestException('Profile already exists');
    }

    const profile = this.profileRepo.create({
      name,
      user,
      location,
    });

    return this.profileRepo.save(profile);
  }

  async getProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  /* -----------------------------------------
   * Client
   * --------------------------------------- */

  async createClient(userId: string, fullName: string): Promise<Client> {
    const profile = await this.getProfileByUserId(userId);

    const existing = await this.clientRepo.findOne({
      where: { profile: { id: profile.id } },
    });

    if (existing) {
      throw new BadRequestException('Client profile already exists');
    }

    const client = this.clientRepo.create({
      fullName,
      profile,
    });

    return this.clientRepo.save(client);
  }

  async assertClient(userId: string): Promise<Client> {
    const profile = await this.getProfileByUserId(userId);

    const client = await this.clientRepo.findOne({
      where: { profile: { id: profile.id } },
    });

    if (!client) {
      throw new ForbiddenException('User is not a client');
    }

    return client;
  }

  /* -----------------------------------------
   * Service Provider
   * --------------------------------------- */

  async createServiceProvider(
    userId: string,
    data: Partial<ServiceProvider>,
  ): Promise<ServiceProvider> {
    const profile = await this.getProfileByUserId(userId);

    const existing = await this.providerRepo.findOne({
      where: { profile: { id: profile.id } },
    });

    if (existing) {
      throw new BadRequestException('Service provider already exists');
    }

    const provider = this.providerRepo.create({
      ...data,
      profile,
      verificationStatus: VerificationStatus.PENDING,
    });

    return this.providerRepo.save(provider);
  }

  async assertServiceProvider(userId: string): Promise<ServiceProvider> {
    const profile = await this.getProfileByUserId(userId);

    const provider = await this.providerRepo.findOne({
      where: { profile: { id: profile.id } },
    });

    if (!provider) {
      throw new ForbiddenException('User is not a service provider');
    }

    if (provider.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new ForbiddenException('Service provider is not verified');
    }

    return provider;
  }

  async getServiceProviderByUser(userId: string): Promise<ServiceProvider> {
    const profile = await this.getProfileByUserId(userId);

    const provider = await this.providerRepo.findOne({
      where: { profile: { id: profile.id } },
    });

    if (!provider) {
      throw new NotFoundException('Service provider not found');
    }

    return provider;
  }

  /* -----------------------------------------
   * Admin Actions
   * --------------------------------------- */

  async verifyServiceProvider(
    providerId: string,
    status: VerificationStatus,
    failureReason?: string,
    role?: Role,
  ): Promise<ServiceProvider> {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    const provider = await this.providerRepo.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Service provider not found');
    }

    provider.verificationStatus = status;
    provider.verificationFailureReason =
      status === VerificationStatus.FAILED ? failureReason : undefined;

    return this.providerRepo.save(provider);
  }
}
