import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3004', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/document-service',
  jwtSecret: process.env.JWT_SECRET || 'seu_segredo_jwt_aqui',
  uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
  logLevel: process.env.LOG_LEVEL || 'info',
  workerServiceUrl: process.env.WORKER_SERVICE_URL || 'http://localhost:3001',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB em bytes
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png,txt,xls,xlsx').split(',')
};