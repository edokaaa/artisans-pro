export enum SubscriptionStatus {
  PENDING = 'pending', // Created, awaiting payment confirmation
  ACTIVE = 'active', // Payment successful, currently valid
  EXPIRED = 'expired', // End date passed
  CANCELLED = 'cancelled', // Admin or system cancelled
}
