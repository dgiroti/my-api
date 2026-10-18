import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env (quiet: true hides the "injected env" message you've been seeing)
dotenv.config({ quiet: true });

// Helper: stop with a clear error if a required setting is missing
// const required = (name: string): string => {
//   const value = process.env[name];
//   if (!value) {
//     throw new Error(`Missing environment variable: ${name}`);
//   }
//   return value;
// };

// The rules every setting must follow.
// If any rule fails, the app refuses to start and lists exactly what's wrong.
const envSchema = z.object({
  // Text from .env is always a string, so "coerce" turns "3000" into the number 3000
  PORT: z.coerce.number().int().positive().default(3000),

  // Required, no fallback: a missing database address should stop the app, not guess
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // Required, no fallback, and long enough to be hard to guess
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),

  // How long a login token lasts: a number followed by s, m, h or d (e.g. 15m, 1h, 7d)
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN must look like 15m, 1h or 7d')
    .default('1h'),

  // Optional on purpose: if not set (like on Lambda), we skip Kafka
  KAFKA_BROKERS: z.string().optional(),

  // NEW: websites allowed to call the API from a browser, comma-separated
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  throw new Error('Invalid environment variables');
}

const env = parsed.data;

// // The port the server runs on (5000 if not set)
// export const PORT = Number(process.env.PORT) || 5000;

// // The secret key used to create and check tokens
// export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// export const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// // NEW: where our MongoDB database lives
// export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/my_api';

// // NEW: Kafka server address(es), e.g. "localhost:9092".
// // Optional on purpose: if it's not set (like on Lambda), we simply skip sending events.
// export const KAFKA_BROKERS = process.env.KAFKA_BROKERS;

// Same export names as before, so no other file needs to change
export const PORT = env.PORT;
export const MONGO_URI = env.MONGO_URI;
export const JWT_SECRET = env.JWT_SECRET;
export const EXPIRES_IN = env.JWT_EXPIRES_IN;
export const KAFKA_BROKERS = env.KAFKA_BROKERS;

export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [];