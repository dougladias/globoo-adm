import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3006', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/meal-control-service',
  jwtSecret: process.env.NEXTAUTH_SECRET || 'seu_segredo_jwt_aqui',
  logLevel: process.env.LOG_LEVEL || 'info',
  workerServiceUrl: process.env.WORKER_SERVICE_URL || 'http://localhost:3001'
};