import dotenv from 'dotenv';
import path from 'path';

// Carregar arquivo .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Variáveis de ambiente
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/worker-service',
  jwtSecret: process.env.JWT_SECRET || 'seu_segredo_jwt_aqui',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost',
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Verifica se as variáveis de ambiente obrigatórias estão definidas
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}