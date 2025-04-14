import payrollRepository from '../repositories/payroll.repository';
import payrollCalculator from './payroll-calculator.service';
import { IPayroll } from '../models/payroll.model';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import axios from 'axios';
import { env } from '../config/env';

class PayrollService {
  async getAllPayrolls(filter = {}): Promise<IPayroll[]> {
    try {
      return await payrollRepository.findAll(filter);
    } catch (error) {
      logger.error('Error getting all payrolls:', error);
      throw error;
    }
  }

  async getPayrollById(id: string): Promise<IPayroll> {
    try {
      const payroll = await payrollRepository.findById(id);
      if (!payroll) {
        throw new AppError('Folha de pagamento não encontrada', 404);
      }
      return payroll;
    } catch (error) {
      logger.error(`Error getting payroll ${id}:`, error);
      throw error;
    }
  }

  async getPayrollsByMonthYear(month: number, year: number): Promise<IPayroll[]> {
    try {
      return await payrollRepository.findByMonthYear(month, year);
    } catch (error) {
      logger.error(`Error getting payrolls for ${month}/${year}:`, error);
      throw error;
    }
  }

  async processPayroll(employeeId: string, month: number, year: number, overtimeHours: number = 0): Promise<IPayroll> {
    try {
      // Verificar se já existe uma folha para este funcionário/mês/ano
      const existingPayroll = await payrollRepository.findByEmployeeMonthYear(employeeId, month, year);
      
      if (existingPayroll) {
        throw new AppError('Já existe uma folha de pagamento para este funcionário neste mês/ano', 409);
      }
      
      // Calcular a folha de pagamento
      const calculation = await payrollCalculator.calculatePayroll(employeeId, overtimeHours);
      
      // Criar a folha de pagamento
      const payroll = await payrollRepository.create(calculation, month, year);
      
      return payroll;
    } catch (error) {
      logger.error(`Error processing payroll for employee ${employeeId} (${month}/${year}):`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao processar folha de pagamento', 500);
    }
  }

  async processMonthlyPayroll(month: number, year: number): Promise<{ processed: number; errors: string[] }> {
    try {
      // Buscar todos os funcionários
      let employees: Array<{ _id: string; name: string; status: string }>;
      try {
        const response = await axios.get(`${env.workerServiceUrl}/api/workers`);
        employees = response.data as Array<{ _id: string; name: string; status: string }>;
      } catch (error) {
        throw new AppError('Erro ao buscar funcionários', 500);
      }
      
      // Excluir folhas existentes para este mês/ano
      await payrollRepository.deleteByMonthYear(month, year);
      
      // Processar folha para cada funcionário
      const processedPayrolls: IPayroll[] = [];
      const errors: string[] = [];
      
      for (const employee of employees) {
        try {
          // Processar apenas funcionários ativos
          if (employee.status === 'active') {
            const payroll = await this.processPayroll(employee._id, month, year);
            processedPayrolls.push(payroll);
          }
        } catch (error) {
          const errorMessage = `Erro ao processar folha para ${employee.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
          errors.push(errorMessage);
          logger.error(errorMessage);
        }
      }
      
      return {
        processed: processedPayrolls.length,
        errors
      };
    } catch (error) {
      logger.error(`Error processing monthly payroll for ${month}/${year}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao processar folha de pagamento mensal', 500);
    }
  }

  async markPayrollAsPaid(id: string): Promise<IPayroll> {
    try {
      const payroll = await payrollRepository.markAsPaid(id);
      if (!payroll) {
        throw new AppError('Folha de pagamento não encontrada', 404);
      }
      return payroll;
    } catch (error) {
      logger.error(`Error marking payroll ${id} as paid:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao marcar folha como paga', 500);
    }
  }

  async generatePayrollPdf(id: string): Promise<Buffer> {
    try {
      // Implementar lógica de geração de PDF
      // Este é um placeholder, você precisaria usar alguma lib como PDFKit
      // para gerar o PDF real
      throw new AppError('Funcionalidade ainda não implementada', 501);
    } catch (error) {
      logger.error(`Error generating PDF for payroll ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao gerar PDF da folha de pagamento', 500);
    }
  }
}

export default new PayrollService();