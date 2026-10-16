import mongoose from 'mongoose';
import { MONGO_URI } from './config';

export const connectDB = async(): Promise<void> => {
    try {
      // readyState 1 means "already connected".
  // Lambda keeps your function "warm" and reuses it for many requests,
  // so we connect once and reuse that connection.
  if (mongoose.connection.readyState === 1) {
    return;
  }

    // "await" means: wait here until the connection is finished
    await mongoose.connect(MONGO_URI,{
      serverSelectionTimeoutMS: 5000, // give up after 5 seconds instead of 30
      family: 4
    });
    console.log('MongoDB connected');
  } catch (error: any) {
    // If MongoDB isn't running or the address is wrong, we end up here
    console.error('MongoDB connection failed:', error);
    if (error?.reason?.servers) {
    for (const [host, desc] of error?.reason?.servers) {
      console.error(host, '→', desc.error?.message);
    }
  }
  process.exit(1);

    // Stop the app, because it can't work without a database
  
  }
}