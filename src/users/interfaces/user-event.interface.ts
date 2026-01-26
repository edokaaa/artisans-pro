export interface UserEventPayload {
  user: EventUser;
}

export interface EventUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_verified_at: string;
}
