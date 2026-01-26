import { PaymentPurpose } from '../entities/payment.entity';

export class InitiateTransactionDto {
  amount: number;
  userId: string;
  offerId?: string;
  offerName?: string;
  subscriptionId?: string;
  subscriptionPlanName?: string;
  purpose: PaymentPurpose;
  authToken: string;
}
