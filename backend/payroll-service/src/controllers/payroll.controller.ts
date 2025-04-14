import { Request, Response, NextFunction } from 'express';
import payrollService from '../services/payroll.service';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';

export const getAllPayrolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payrolls = await payrollService.getAllPayrolls();
    res.status(200).json(payrolls);
  } catch (error) {
    logger.error('Error in getAllPayrolls controller:', error);
    next(error);
  }
};

export const getPayrollById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payroll = await payrollService.getPayrollById(id);
    res.status(200).json(payroll);
  } catch (error) {
    logger.error(`Error in getPayrollById controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const getPayrollsByMonthYear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    
    // Validar parâmetros
    if (!month || !year) {
      throw new AppError('Mês e ano são obrigatórios', 400);
    }
    
    const monthNum = parseInt(month as string);
    const yearNum = parseInt(year as string);
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new AppError('Mês inválido', 400);
    }
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      throw new AppError('Ano inválido', 400);
    }
    
    const payrolls = await payrollService.getPayrollsByMonthYear(monthNum, yearNum);
    res.status(200).json(payrolls);
  } catch (error) {
    logger.error(`Error in getPayrollsByMonthYear controller:`, error);
    next(error);
  }
};

export const processPayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, month, year, overtimeHours } = req.body;
    
    // Validar parâmetros
    if (!employeeId || !month || !year) {
      throw new AppError('ID do funcionário, mês e ano são obrigatórios', 400);
    }
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const overtimeHoursNum = overtimeHours ? parseInt(overtimeHours) : 0;
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new AppError('Mês inválido', 400);
    }
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      throw new AppError('Ano inválido', 400);
    }
    
    if (isNaN(overtimeHoursNum) || overtimeHoursNum < 0) {
      throw new AppError('Horas extras inválidas', 400);
    }
    
    const payroll = await payrollService.processPayroll(employeeId, monthNum, yearNum, overtimeHoursNum);
    res.status(201).json(payroll);
  } catch (error) {
    logger.error(`Error in processPayroll controller:`, error);
    next(error);
  }
};

export const processMonthlyPayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.body;
    
    // Validar parâmetros
    if (!month || !year) {
      throw new AppError('Mês e ano são obrigatórios', 400);
    }
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new AppError('Mês inválido', 400);
    }
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      throw new AppError('Ano inválido', 400);
    }
    
    const result = await payrollService.processMonthlyPayroll(monthNum, yearNum);
    res.status(200).json({
      message: `Folha de pagamento mensal processada com sucesso. ${result.processed} funcionários processados.`,
      ...result
    });
  } catch (error) {
    logger.error(`Error in processMonthlyPayroll controller:`, error);
    next(error);
  }
};

export const markPayrollAsPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payroll = await payrollService.markPayrollAsPaid(id);
    res.status(200).json({
      message: 'Folha de pagamento marcada como paga',
      payroll
    });
  } catch (error) {
    logger.error(`Error in markPayrollAsPaid controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const generatePayrollPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Note que esse método ainda não está implementado no serviço
    // é apenas um placeholder para futura implementação
    const pdfBuffer = await payrollService.generatePayrollPdf(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=holerite_${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error(`Error in generatePayrollPdf controller for id ${req.params.id}:`, error);
    
    // Se o erro for 501 (Not Implemented), fornecer uma resposta útil
    if (error instanceof AppError && error.statusCode === 501) {
      return res.status(501).json({
        message: 'Funcionalidade de geração de PDF ainda não implementada',
        alternative: `Use a rota /api/payroll/holerite/${req.params.id} para visualizar o holerite em HTML`
      });
    }
    
    next(error);
  }
};