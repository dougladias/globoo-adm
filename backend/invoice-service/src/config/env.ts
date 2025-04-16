import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3008', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/invoice-service',
  jwtSecret: process.env.JWT_SECRET || 'seu_segredo_jwt_aqui',
  uploadDir: process.env.UPLOAD_DIR || 'public/uploads/invoices',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB em bytes
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'application/pdf,image/jpeg,image/png,application/xml').split(',')
};