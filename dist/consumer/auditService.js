"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const db_1 = require("../config/db");
const config_1 = require("../config/config");
const AuditLog_1 = require("../models/AuditLog");
const events_1 = require("../kafka/events");
const start = async () => {
    // Unlike the API, this service is useless without Kafka, so it's required here
    if (!config_1.KAFKA_BROKERS) {
        throw new Error('KAFKA_BROKERS is required for the audit service');
    }
    // 1. Connect to MongoDB Atlas (to save audit logs)
    await (0, db_1.connectDB)();
    const kafka = new kafkajs_1.Kafka({
        clientId: 'audit-service',
        brokers: config_1.KAFKA_BROKERS.split(','),
    });
    // 2. Make sure the topic exists (does nothing if it already does)
    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({ topics: [{ topic: events_1.USER_EVENTS_TOPIC, numPartitions: 1 }] });
    await admin.disconnect();
    // 3. Join the consumer group "audit-service".
    //    Kafka remembers this group's bookmark (offset), so after a restart
    //    it continues exactly where it stopped.
    const consumer = kafka.consumer({ groupId: 'audit-service' });
    await consumer.connect();
    // 4. Subscribe to our topic. fromBeginning: true = on the very first run,
    //    read all old messages too (later runs use the bookmark instead)
    await consumer.subscribe({ topic: events_1.USER_EVENTS_TOPIC, fromBeginning: true });
    console.log('Audit service is listening for user events...');
    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value)
                return;
            // Turn the JSON text back into an object
            const event = JSON.parse(message.value.toString());
            console.log(`[AUDIT] ${event.type} - ${event.email} at ${event.timestamp}`);
            // Save it in Atlas
            await AuditLog_1.AuditLog.create({
                type: event.type,
                email: event.email,
                userId: event.userId,
                timestamp: new Date(event.timestamp),
            });
        }
    });
};
start().catch((error) => {
    console.error('Audit service failed to start:', error);
    process.exit(1);
});
