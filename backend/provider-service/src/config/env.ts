import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3007', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/material-service',
  jwtSecret: process.env.JWT_SECRET || 'seu_segredo_jwt_aqui',
  logLevel: process.env.LOG_LEVEL || 'info'
};