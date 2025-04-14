import { env } from './env';

export const config = {
  port: env.port,
  nodeEnv: env.nodeEnv,
  // Configurações adicionais da aplicação
  cors: {
    origin: '*', // Em produção, deve-se limitar a origens específicas
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por janela por IP
  }
};