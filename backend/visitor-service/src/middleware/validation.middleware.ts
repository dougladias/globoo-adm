import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from '../utils/error-handler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Executar todas as validações
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Verificar se houve erros
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Caso haja erros, retornar erro 400 com detalhes
    next(new AppError('Erro de validação', 400, errors.array()));
  };
};