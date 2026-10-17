"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUserEvent = exports.connectProducer = void 0;
const kafkajs_1 = require("kafkajs");
const config_1 = require("../config/config");
const events_1 = require("./events");
const AuditLog_1 = require("../models/AuditLog"); // NEW (add with the other imports)
// null means "not connected". It stays null on Lambda, where KAFKA_BROKERS isn't set.
let producer = null;
const connectProducer = async () => {
    if (!config_1.KAFKA_BROKERS) {
        console.log('KAFKA_BROKERS not set, user events will not be sent');
        return;
    }
    const kafka = new kafkajs_1.Kafka({
        clientId: 'my-api', // a name so Kafka knows who's talking
        brokers: config_1.KAFKA_BROKERS.split(','), // "a:9092,b:9092" → ["a:9092", "b:9092"]
    });
    // DefaultPartitioner just picks the recommended setting (and hides a warning)
    producer = kafka.producer({ createPartitioner: kafkajs_1.Partitioners.DefaultPartitioner });
    await producer.connect();
    console.log('Kafka producer connected');
};
exports.connectProducer = connectProducer;
// Called from the controller whenever something happens
// export const sendUserEvent = async (
//   type: UserEventType,
//   email: string,
//   userId?: string
// ): Promise<void> => {
//     // No Kafka? Quietly do nothing.
//   if (!producer) return;
//   const event: UserEvent = {
//     type,
//     email,
//     userId,
//     timestamp: new Date().toISOString(),
//   };
//   try {
//     await producer.send({
//       topic: USER_EVENTS_TOPIC,
//       // Kafka messages are text, so we turn the object into a JSON string
//       messages: [{ key: email, value: JSON.stringify(event) }],
//     });
//   } catch (error) {
//     // If Kafka has a problem, log it, but DON'T break the login
//     console.error('Failed to send user event:', error);
//   }
// }
const sendUserEvent = async (type, email, userId) => {
    const event = {
        type,
        email,
        userId,
        timestamp: new Date().toISOString(),
    };
    // NEW: No Kafka here (e.g. on Lambda)? Save the audit record directly to MongoDB instead.
    if (!producer) {
        try {
            await AuditLog_1.AuditLog.create({
                type: event.type,
                email: event.email,
                userId: event.userId,
                timestamp: new Date(event.timestamp),
                source: 'direct',
            });
        }
        catch (error) {
            // Same rule as before: auditing must never break a login
            console.error('Failed to save audit log:', error);
        }
        return;
    }
    // Kafka is available: send the event, and the audit service will save it
    try {
        await producer.send({
            topic: events_1.USER_EVENTS_TOPIC,
            messages: [{ key: email, value: JSON.stringify(event) }],
        });
    }
    catch (error) {
        console.error('Failed to send user event:', error);
    }
};
exports.sendUserEvent = sendUserEvent;
