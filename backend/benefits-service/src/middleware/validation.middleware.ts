import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/error-handler';

// Validação para criação/atualização de tipos de benefício
export const validateBenefitTypeInput = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('hasDiscount').isBoolean().withMessage('hasDiscount deve ser um booleano'),
  body('discountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentual de desconto deve estar entre 0 e 100'),
  body('defaultValue')
    .isFloat({ min: 0 })
    .withMessage('Valor padrão deve ser um número positivo'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status deve ser active ou inactive'),
  
  // Middleware para verificar erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation error', 400, errors.array());
    }
    next();
  }
];

// Validação para criação/atualização de benefícios de funcionários
export const validateEmployeeBenefitInput = [
  body('employeeId').notEmpty().withMessage('ID do funcionário é obrigatório'),
  body('benefitTypeId').notEmpty().withMessage('ID do tipo de benefício é obrigatório'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor deve ser um número positivo'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status deve ser active ou inactive'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO8601'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de término deve estar no formato ISO8601'),
  
  // Middleware para verificar erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation error', 400, errors.array());
    }
    next();
  }
];