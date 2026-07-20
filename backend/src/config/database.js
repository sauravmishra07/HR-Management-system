import mongoose from 'mongoose';
import config from './index.js';
import logger from '../common/utils/logger.js';

mongoose.set('strictQuery', true);

/** Connect to MongoDB with sensible pool + timeout settings. */
export async function connectDatabase() {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => logger.error('MongoDB connection error', { message: err.message }));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

    return conn;
  } catch (err) {
    logger.error('MongoDB initial connection failed', { message: err.message });
    throw err;
  }
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}
