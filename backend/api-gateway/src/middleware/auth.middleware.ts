import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

// Interface para o payload do token JWT
interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Estender o tipo Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se o token JWT está presente no header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Não autorizado - Token não fornecido', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar e decodificar o token
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Não autorizado - Token expirado', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Não autorizado - Token inválido', 401);
      } else {
        throw new AppError('Não autorizado', 401);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar se o usuário tem um papel específico
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Não autorizado', 401);
      }
      
      if (!roles.includes(req.user.role)) {
        throw new AppError('Acesso proibido - Permissão insuficiente', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};