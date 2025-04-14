import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3002', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/benefits-service',
  jwtSecret: process.env.JWT_SECRET || 'seu_segredo_jwt_aqui',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost',
  logLevel: process.env.LOG_LEVEL || 'info',
  workerServiceUrl: process.env.WORKER_SERVICE_URL || 'http://localhost:3001'
};