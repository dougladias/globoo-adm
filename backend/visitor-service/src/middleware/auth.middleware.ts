import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/error-handler';

// Interface estendida para Request com usuário
export interface RequestWithUser extends Request {
  user?: any;
}

export const authenticate = (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Token de autenticação inválido', 401);
    }
    
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        next(new AppError('Token inválido', 401));
      } else if (error.name === 'TokenExpiredError') {
        next(new AppError('Token expirado', 401));
      } else {
        next(error);
      }
    } else {
      next(new AppError('Erro desconhecido', 500));
    }
  }
};