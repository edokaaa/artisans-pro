export class createTransactionRecordDto {
  user_id: string;
  transaction_type: string;
  amount: number;
  status: string;
  paid_amount: number;
  service_charge?: number;
  reference?: string;
  narration: string;
  provider?: string;
  provider_reference?: string;
  payment_provider_id?: string;
}
