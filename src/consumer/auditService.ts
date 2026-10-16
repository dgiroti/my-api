import { Kafka } from 'kafkajs';
import { connectDB } from '../config/db';
import { KAFKA_BROKERS } from '../config/config';
import { AuditLog } from '../models/AuditLog';
import { USER_EVENTS_TOPIC, UserEvent } from '../kafka/events';

const start = async (): Promise<void> => {
    // Unlike the API, this service is useless without Kafka, so it's required here
    if (!KAFKA_BROKERS) {
        throw new Error('KAFKA_BROKERS is required for the audit service');
    }

    // 1. Connect to MongoDB Atlas (to save audit logs)
    await connectDB();

    const kafka = new Kafka({
        clientId: 'audit-service',
        brokers: KAFKA_BROKERS.split(','),
    });

    // 2. Make sure the topic exists (does nothing if it already does)
    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({ topics: [{ topic: USER_EVENTS_TOPIC, numPartitions: 1 }] });
    await admin.disconnect();

    // 3. Join the consumer group "audit-service".
    //    Kafka remembers this group's bookmark (offset), so after a restart
    //    it continues exactly where it stopped.
    const consumer = kafka.consumer({ groupId: 'audit-service' });
    await consumer.connect();

    // 4. Subscribe to our topic. fromBeginning: true = on the very first run,
    //    read all old messages too (later runs use the bookmark instead)
    await consumer.subscribe({ topic: USER_EVENTS_TOPIC, fromBeginning: true });

    console.log('Audit service is listening for user events...');

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return;

            // Turn the JSON text back into an object
            const event = JSON.parse(message.value.toString()) as UserEvent;

            console.log(`[AUDIT] ${event.type} - ${event.email} at ${event.timestamp}`);

            // Save it in Atlas
            await AuditLog.create({
                type: event.type,
                email: event.email,
                userId: event.userId,
                timestamp: new Date(event.timestamp),
            });
        }
    })
}

start().catch((error) => {
  console.error('Audit service failed to start:', error);
  process.exit(1);
});