import dotenv from 'dotenv';

// Read the .env file and put its values into process.env
dotenv.config();

// Helper: stop with a clear error if a required setting is missing
const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

// The port the server runs on (5000 if not set)
export const PORT = Number(process.env.PORT) || 5000;

// The secret key used to create and check tokens
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// NEW: where our MongoDB database lives
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/my_api';

// NEW: Kafka server address(es), e.g. "localhost:9092".
// Optional on purpose: if it's not set (like on Lambda), we simply skip sending events.
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS;