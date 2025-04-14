import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Configuração básica de rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas requisições, por favor tente novamente mais tarde',
    limit: 100,
    windowMs: 15 * 60 * 1000
  },
  skip: () => env.nodeEnv === 'development' // Desabilitar em desenvolvimento
});

// Rate limit mais restritivo para rotas sensíveis
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // limite de 10 requisições por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas tentativas de autenticação, por favor tente novamente mais tarde',
    limit: 10,
    windowMs: 15 * 60 * 1000
  },
  skip: () => env.nodeEnv === 'development' // Desabilitar em desenvolvimento
});