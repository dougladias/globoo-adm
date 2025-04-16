import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.statusCode,
        errors: err.errors || undefined
      }
    });
  }
  // Erros do Mongoose ou outros tipos de erros
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Erro de validação',
        code: 400,
        errors: err
      }
    });
  }

  // Erro interno
  return res.status(500).json({
    error: {
      message: 'Erro interno do servidor',
      code: 500
    }
  });
};