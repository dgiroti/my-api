// The name of the Kafka topic (channel) all user events go into
export const USER_EVENTS_TOPIC = 'user-events';

// The only three kinds of events we send.
// TypeScript will complain if we ever type a different one by mistake.
export type UserEventType = 'USER_REGISTERED' | 'USER_LOGGED_IN' | 'LOGIN_FAILED';

// The shape of every message
export interface UserEvent {
  type: UserEventType;
  email: string;
  userId?: string;   // "?" means optional: failed logins may not have a user
  timestamp: string; // when it happened
}