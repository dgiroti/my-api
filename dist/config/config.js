"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KAFKA_BROKERS = exports.MONGO_URI = exports.EXPIRES_IN = exports.JWT_SECRET = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Read the .env file and put its values into process.env
dotenv_1.default.config();
// Helper: stop with a clear error if a required setting is missing
const required = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
};
// The port the server runs on (5000 if not set)
exports.PORT = Number(process.env.PORT) || 5000;
// The secret key used to create and check tokens
exports.JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
exports.EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
// NEW: where our MongoDB database lives
exports.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/my_api';
// NEW: Kafka server address(es), e.g. "localhost:9092".
// Optional on purpose: if it's not set (like on Lambda), we simply skip sending events.
exports.KAFKA_BROKERS = process.env.KAFKA_BROKERS;
