import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'seu_segredo_jwt_aqui',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Serviços
  services: {
    worker: process.env.WORKER_SERVICE_URL || 'http://localhost:3001',
    benefits: process.env.BENEFITS_SERVICE_URL || 'http://localhost:3002',
    payroll: process.env.PAYROLL_SERVICE_URL || 'http://localhost:3003',
    document: process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3004'
  }
};