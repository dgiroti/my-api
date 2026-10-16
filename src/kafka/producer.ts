import { Kafka, Partitioners, Producer } from 'kafkajs';
import { KAFKA_BROKERS } from '../config/config';
import { USER_EVENTS_TOPIC, UserEvent, UserEventType } from './events';

// null means "not connected". It stays null on Lambda, where KAFKA_BROKERS isn't set.
let producer: Producer | null = null;

export const connectProducer = async (): Promise<void> => {
    if (!KAFKA_BROKERS) {
    console.log('KAFKA_BROKERS not set, user events will not be sent');
    return;
  }

  const kafka = new Kafka({
    clientId: 'my-api',                 // a name so Kafka knows who's talking
    brokers: KAFKA_BROKERS.split(','),  // "a:9092,b:9092" → ["a:9092", "b:9092"]
  });

  // DefaultPartitioner just picks the recommended setting (and hides a warning)
  producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
  await producer.connect();
  console.log('Kafka producer connected');

}

// Called from the controller whenever something happens
export const sendUserEvent = async (
  type: UserEventType,
  email: string,
  userId?: string
): Promise<void> => {
    // No Kafka? Quietly do nothing.
  if (!producer) return;

  const event: UserEvent = {
    type,
    email,
    userId,
    timestamp: new Date().toISOString(),
  };

  try {
    await producer.send({
      topic: USER_EVENTS_TOPIC,
      // Kafka messages are text, so we turn the object into a JSON string
      messages: [{ key: email, value: JSON.stringify(event) }],
    });
  } catch (error) {
    // If Kafka has a problem, log it, but DON'T break the login
    console.error('Failed to send user event:', error);
  }

}
