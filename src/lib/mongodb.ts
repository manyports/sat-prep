import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'test';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let mongooseConnectionPromise: Promise<typeof mongoose> | null = null;

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToMongoose() {
  if (mongooseConnectionPromise) {
    await mongooseConnectionPromise;
    return { db: mongoose.connection.db };
  }
  
  if (mongoose.connection.readyState === 1) {
    return { db: mongoose.connection.db };
  }

  mongooseConnectionPromise = mongoose.connect(MONGODB_URI as string, {
    dbName: MONGODB_DB,
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  try {
    await mongooseConnectionPromise;
    return { db: mongoose.connection.db };
  } catch (error) {
    console.error('Mongoose connection error:', error);
    mongooseConnectionPromise = null;
    throw error;
  }
}

export default async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI as string, {
    maxPoolSize: 10,
    minPoolSize: 5,
  });

  const db = client.db(MONGODB_DB);
  
  cachedClient = client;
  cachedDb = db;

  return { client, db };
} 