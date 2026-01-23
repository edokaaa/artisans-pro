import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Offer } from './entities/offer.entity';
import { OfferStatus } from 'src/common/enums/offer-status.enum';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,

    private readonly usersService: UsersService,
  ) {}

  async createOffer(userId: string, data: CreateOfferDto): Promise<Offer> {
    const client = await this.usersService.assertClient(userId);
    const serviceProvider = await this.usersService.getServiceProviderById(
      data.serviceProviderId,
    );

    const offer = this.offerRepo.create({
      ...data,
      client,
      serviceProvider,
      status: OfferStatus.PENDING,
    });

    // TODO: Activity (new offer)
    return this.offerRepo.save(offer);
  }

  async respondToOffer(
    providerUserId: string,
    offerId: string,
    status: OfferStatus.ACCEPTED | OfferStatus.DECLINED,
  ): Promise<Offer> {
    const provider =
      await this.usersService.assertServiceProvider(providerUserId);

    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
      relations: ['serviceProvider'],
    });

    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.serviceProvider.id !== provider.id) {
      throw new ForbiddenException('Not authorized');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Offer already processed');
    }

    offer.status = status;
    // TODO: Activity (make payment - client)
    return this.offerRepo.save(offer);
  }

  async makePayment(offerId: string) {
    // TODO: pending
    throw new BadRequestException('Feature pending');
  }
}
