import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axiosRetry from 'axios-retry';
import { firstValueFrom } from 'rxjs';
import { createTransactionRecordDto } from './dto/create-transaction-record.dto';
import { InitiateTransactionDto } from './dto/initiate-transaction.dto';
import { PaymentPurpose } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly http: HttpService) {
    axiosRetry(this.http.axiosRef, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: any) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status && error.response?.status >= 500)
        );
      },
    });
  }

  private get baseUrl() {
    return process.env.PAYMENT_SERVICE_BASE_URL;
  }

  private get headers() {
    return {
      'x-service-secret': process.env.PAYMENT_SERVICE_SECRET,
      // 'Authorization':
    };
  }

  // -----------------------------
  // Initiate Transaction
  // -----------------------------
  async initiateTransaction(payload: InitiateTransactionDto) {
    try {
      const reqPayload = {
        amount: payload.amount,
        service:
          payload.purpose === PaymentPurpose.OFFER
            ? 'proservice.offer'
            : 'proservice.subscription',
        payload: {
          offerId: payload.offerId,
          offerName: payload.offerName,
          subscriptionId: payload.subscriptionId,
          subscriptionPlanName: payload.subscriptionPlanName,
          amount: payload.amount,
        },
      };

      const headers = {
        ...this.headers,
        'x-user-id': payload.userId,
        authorization: payload.authToken,
      };
      const res = await firstValueFrom(
        this.http.post(`${this.baseUrl}/transaction/initiate`, reqPayload, {
          headers,
          timeout: 5_000,
        }),
      );

      return res.data;
    } catch (err) {
      this.logger.error(
        'Failed to initiate transaction',
        err?.response?.data || err.message,
      );
      throw new InternalServerErrorException('Payment initiation failed');
    }
  }

  // -----------------------------
  // Reverse Debit (Compensation)
  // -----------------------------
  async reverseDebit(sessionId: string) {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/transaction/reverse-debit`,
          { session_id: sessionId },
          {
            headers: this.headers,
            timeout: 5_000,
          },
        ),
      );

      this.logger.warn(`Debit reversed successfully: ${sessionId}`);
    } catch (err) {
      this.logger.error(
        `Failed to reverse debit: ${sessionId}`,
        err?.response?.data || err.message,
      );

      /**
       * IMPORTANT:
       * We DO NOT throw here.
       * Failed reversals must be retried asynchronously
       * (DLQ / cron / ops intervention).
       */
    }
  }

  // -----------------------------
  // Create Transaction Record
  // -----------------------------
  async createTransactionRecord(payload: createTransactionRecordDto) {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/transaction/create-transaction-record`,
          payload,
          {
            headers: this.headers,
            timeout: 5_000,
          },
        ),
      );
    } catch (err) {
      this.logger.error(
        'Failed to create transaction record',
        err?.response?.data || err.message,
      );

      /**
       * CRITICAL:
       * The debit already happened.
       * This failure MUST be retried (DLQ).
       */
      throw new InternalServerErrorException(
        'Transaction record persistence failed',
      );
    }
  }
}
