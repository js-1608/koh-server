import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initDatabaseSync } from '../services/dbService';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/koh_command_center';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);

    // Trigger full synchronization between database and application
    await initDatabaseSync();
  } catch (error: any) {
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB at ${MONGODB_URI}. (${error.message})`);
    console.log(`[Data Store] Using resilient fallback store.`);
  }
};

