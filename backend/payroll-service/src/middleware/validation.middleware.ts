import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/error-handler';

// Validação para processamento de folha de pagamento individual
export const validateProcessPayroll = [
  body('employeeId').notEmpty().withMessage('ID do funcionário é obrigatório'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Mês deve ser um número entre 1 e 12'),
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Ano deve ser um número entre 2000 e 2100'),
  body('overtimeHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Horas extras devem ser um número positivo'),
  
  // Middleware para verificar erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation error', 400, errors.array());
    }
    next();
  }
];

// Validação para processamento de folha mensal
export const validateProcessMonthlyPayroll = [
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Mês deve ser um número entre 1 e 12'),
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Ano deve ser um número entre 2000 e 2100'),
  
  // Middleware para verificar erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation error', 400, errors.array());
    }
    next();
  }
];