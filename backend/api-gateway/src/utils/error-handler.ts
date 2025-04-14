import { Request, Response, NextFunction } from 'express';
import logger from './logger';

interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}
/// Middleware para tratamento de erros
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  // Log do erro
  logger.error(`Error ${statusCode}: ${err.message}`, {
    method: req.method,
    path: req.path,
    error: err,
    stack: err.stack
  });
  
  // Resposta para o cliente
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Cria um erro com status code
export class AppError extends Error {
  statusCode: number;
  errors?: any[];

  // Construtor da classe AppError
  // Recebe uma mensagem, um status code e um array de erros (opcional)
  constructor(message: string, statusCode = 400, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Para que o instanceof funcione corretamente
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Captura 404 para rotas não encontradas
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};