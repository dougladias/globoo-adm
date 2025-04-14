import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/error-handler';

// Validação para criação/atualização de worker
export const validateWorkerInput = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('cpf').notEmpty().withMessage('CPF é obrigatório'),
  body('nascimento').isISO8601().withMessage('Data de nascimento inválida'),
  body('admissao').isISO8601().withMessage('Data de admissão inválida'),
  body('salario').notEmpty().withMessage('Salário é obrigatório'),
  body('numero').notEmpty().withMessage('Número é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('address').notEmpty().withMessage('Endereço é obrigatório'),
  body('contract').isIn(['CLT', 'PJ']).withMessage('Contrato deve ser CLT ou PJ'),
  body('role').notEmpty().withMessage('Cargo é obrigatório'),
  
  // Middleware para verificar erros de validação
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation error', 400, errors.array());
    }
    next();
  }
];