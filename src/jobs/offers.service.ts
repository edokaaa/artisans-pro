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
import { PaymentsService } from 'src/payments/payments.service';
import { PaymentPurpose } from 'src/payments/entities/payment.entity';
import { InitiateTransactionDto } from 'src/payments/dto/initiate-transaction.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,

    private readonly usersService: UsersService,

    private readonly paymentsService: PaymentsService,
  ) {}

  async createOffer(userId: string, data: CreateOfferDto): Promise<Offer> {
    const client = await this.usersService.assertClient(userId);

    const offer = this.offerRepo.create({
      ...data,
      client: { id: client.id },
      serviceProvider: { id: data.serviceProviderId },
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

  async makePayment(offerId: string, clientUserId: string, authToken: string) {
    const offer = await this.get(offerId, ['client']);
    const client = await this.usersService.assertClient(clientUserId);

    if (client.id !== offer.client.id) {
      throw new BadRequestException('Invalid Request: invalid client offer!');
    }

    if (offer.status !== OfferStatus.ACCEPTED) {
      throw new BadRequestException(
        'Invalid Request: offer must be accepted first!',
      );
    }

    const payload: InitiateTransactionDto = {
      amount: offer.amount,
      offerName: offer.title,
      userId: clientUserId,
      offerId,
      authToken,
      purpose: PaymentPurpose.OFFER,
    };

    return await this.paymentsService.initiateTransaction(payload);
  }

  async get(offerId: string, relations: string[] = []): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
      relations,
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  /* -----------------------------
   * Payment success handler
   * (called by RabbitMQ consumer)
   * ----------------------------- */
  async markOfferAsPaid(offerId: string, useEscrow: boolean) {
    const offer = await this.get(offerId);

    if (offer.status === OfferStatus.PAYMENT_MADE) {
      return offer; // idempotent
    }

    offer.status = OfferStatus.PAYMENT_MADE;
    offer.useEscrow = useEscrow;

    if (useEscrow) {
      offer.escrowStatus = 'held';
    }

    return this.offerRepo.save(offer);
  }

  /* -----------------------------
   * Job completed → release escrow
   * ----------------------------- */
  async releaseEscrow(offerId: string) {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
    });

    if (!offer || !offer.useEscrow) return;

    offer.escrowStatus = 'released';
    return this.offerRepo.save(offer);
  }

  /* -----------------------------
   * Admin / system cancel
   * ----------------------------- */
  async cancelOffer(offerId: string, reason?: string) {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException();
    }

    offer.status = OfferStatus.CANCELLED;
    offer.cancellationReason = reason;

    return this.offerRepo.save(offer);
  }
}
