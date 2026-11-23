import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initDatabaseSync } from '../services/dbService';

dotenv.config();

const getSanitizedMongoUri = (): string => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/koh_command_center';
  if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
    try {
      const protocolEnd = uri.indexOf('://') + 3;
      const protocol = uri.substring(0, protocolEnd);
      const rest = uri.substring(protocolEnd);
      const atIndex = rest.lastIndexOf('@');
      if (atIndex > 0) {
        const auth = rest.substring(0, atIndex);
        let hostAndParams = rest.substring(atIndex + 1);
        const colonIndex = auth.indexOf(':');
        if (colonIndex > 0) {
          const user = auth.substring(0, colonIndex);
          const pass = auth.substring(colonIndex + 1);
          const encodedPass = encodeURIComponent(decodeURIComponent(pass));
          // If trailing slash or missing database, specify database name
          if (!hostAndParams.includes('/') || hostAndParams.endsWith('/')) {
            const host = hostAndParams.replace(/\/$/, '');
            hostAndParams = `${host}/koh_command_center?retryWrites=true&w=majority`;
          }
          return `${protocol}${user}:${encodedPass}@${hostAndParams}`;
        }
      }
    } catch {
      // fallback to original uri
    }
  }
  return uri;
};

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const finalUri = getSanitizedMongoUri();

  try {
    const conn = await mongoose.connect(finalUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);

    // Trigger full synchronization between database and application
    await initDatabaseSync();
  } catch (error: any) {
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB. (${error.message})`);
    console.log(`[Data Store] Using resilient fallback store.`);
  }
};

