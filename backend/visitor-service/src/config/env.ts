import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3005', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/visitor-service',
  jwtSecret: process.env.JWT_SECRET || 'seu_segredo_jwt_aqui',
  uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxPhotoSize: parseInt(process.env.MAX_PHOTO_SIZE || '5242880', 10), // 5MB em bytes
  allowedPhotoTypes: (process.env.ALLOWED_PHOTO_TYPES || 'image/jpeg,image/png,image/jpg').split(',')
};