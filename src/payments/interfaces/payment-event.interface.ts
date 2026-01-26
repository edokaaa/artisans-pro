export interface PaymentEventPayload {
  id: string; //session_id
  user_id: string;
  amount: number;
  reference: string;
  payload: string;
}

export interface PaymentEventSession {
  session: PaymentEventPayload;
  timestamp: string;
}

export interface PaymentPayload {
  offerId?: string;
  offerName?: string;
  subscriptionId?: string;
  subscriptionPlanName?: string;
  useEscrow?: boolean;
}
