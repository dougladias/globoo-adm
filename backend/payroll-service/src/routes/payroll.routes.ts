import { Router, Request, Response, NextFunction } from 'express';
import * as payrollController from '../controllers/payroll.controller';
import { validateProcessPayroll, validateProcessMonthlyPayroll } from '../middleware/validation.middleware';

const router = Router();

// Rotas para consulta
router.get('/', payrollController.getAllPayrolls);
router.get('/month', payrollController.getPayrollsByMonthYear);
router.get('/:id', payrollController.getPayrollById);

// Rotas para processamento
router.post('/process', validateProcessPayroll, payrollController.processPayroll);
router.post('/process-monthly', validateProcessMonthlyPayroll, payrollController.processMonthlyPayroll);

// Rotas para ações
router.patch('/:id/mark-paid', payrollController.markPayrollAsPaid);
// Envolve a chamada assíncrona do controlador para garantir a compatibilidade de tipos e o tratamento de erros
router.get('/:id/pdf', (req: Request, res: Response, next: NextFunction) => {
	payrollController.generatePayrollPdf(req, res, next).catch(next);
});

export default router;