export interface PaymentEventPayload {
  session_id: string;
  user_id: string;
  amount: number;
  status: string;
  reference: string;
  payload: Payload;
}

export interface Payload {
  subscriptionId: string;
  offerId: string;
  useEscrow: boolean;
}
