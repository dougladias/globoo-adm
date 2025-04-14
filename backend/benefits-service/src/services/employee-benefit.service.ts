import employeeBenefitRepository from '../repositories/employee-benefit.repository';
import benefitTypeRepository from '../repositories/benefit-type.repository';
import { IEmployeeBenefit } from '../models/benefit.model';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import axios from 'axios';

// Definir interface AxiosError já que não é exportada nesta versão
interface AxiosError {
  isAxiosError: boolean;
  response?: {
    status: number;
    data: any;
  };
  request?: any;
  message: string;
}

// Função de guarda de tipo personalizada
function isAxiosError(error: any): error is AxiosError {
  return error && error.isAxiosError === true;
}
import { env } from '../config/env';

// Importar o logger do seu utilitário de logging
class EmployeeBenefitService {
  async getAllEmployeeBenefits(filter = {}): Promise<IEmployeeBenefit[]> {
    try {
      return await employeeBenefitRepository.findAll(filter);
    } catch (error) {
      logger.error('Error getting all employee benefits:', error);
      throw error;
    }
  }

     
    // Verifica se o benefício existe antes de retornar
  async getEmployeeBenefitById(id: string): Promise<IEmployeeBenefit> {
    try {
      const benefit = await employeeBenefitRepository.findById(id);
      if (!benefit) {
        throw new AppError('Employee benefit not found', 404);
      }
      return benefit;
    } catch (error) {
      logger.error(`Error getting employee benefit ${id}:`, error);
      throw error;
    }
  }

  
  // Verifica se o funcionário existe no serviço de workers antes de buscar os benefícios
  async getEmployeeBenefitsByEmployeeId(employeeId: string): Promise<IEmployeeBenefit[]> {
    try {
      // First check if the employee exists
      try {
        await axios.get(`${env.workerServiceUrl}/api/workers/${employeeId}`);
      } catch (error: unknown) {
        let isNotFoundError = false;
        if (isAxiosError(error)) {
          // Dentro deste bloco, o erro está corretamente tipado como AxiosError
          const axiosError: AxiosError = error;
          const response = axiosError.response;
          if (response && response.status === 404) {
            isNotFoundError = true;
          }
        }
        // Se o erro for 404, lançamos um erro específico       
        if (isNotFoundError) {
          throw new AppError('Employee not found', 404);
        }

        // Registra outros erros mas continua a execução
        logger.warn(`Could not validate employee ${employeeId}:`, error);
        // Continuamos mesmo sem conseguir validar (para evitar falhas se o serviço de workers estiver indisponível)
      }
      // Se o funcionário existe, buscamos os benefícios
      return await employeeBenefitRepository.findByEmployeeId(employeeId);
    } catch (error) {
      logger.error(`Error getting benefits for employee ${employeeId}:`, error);
      throw error;
    }
  }

  // Verifica se o tipo de benefício existe antes de criar
  async createEmployeeBenefit(data: Partial<IEmployeeBenefit>): Promise<IEmployeeBenefit> {
    try {
      // Verificar se o tipo de benefício existe
      const benefitType = await benefitTypeRepository.findById(String(data.benefitTypeId));
      if (!benefitType) {
        throw new AppError('Benefit type not found', 404);
      }

      // Verificar se o funcionário já possui este benefício ativo
      const existingBenefit = await employeeBenefitRepository.findAll({
        employeeId: data.employeeId,
        benefitTypeId: data.benefitTypeId,
        status: 'active'
      });

      // Se já existir um benefício ativo, lançar um erro
      if (existingBenefit.length > 0) {
        throw new AppError('Employee already has this benefit active', 409);
      }

      // Se value não for fornecido, usar o defaultValue do tipo de benefício
      if (!data.value && benefitType.defaultValue) {
        data.value = benefitType.defaultValue;
      }

      // Se startDate não for fornecido, usar a data atual
      return await employeeBenefitRepository.create(data);
    } catch (error) {
      logger.error('Error creating employee benefit:', error);
      throw error;
    }
  }

  // Verifica se o benefício existe antes de atualizar
  async updateEmployeeBenefit(id: string, data: Partial<IEmployeeBenefit>): Promise<IEmployeeBenefit> {
    try {
      const benefit = await employeeBenefitRepository.update(id, data);
      if (!benefit) {
        throw new AppError('Employee benefit not found', 404);
      }
      return benefit;
    } catch (error) {
      logger.error(`Error updating employee benefit ${id}:`, error);
      throw error;
    }
  }

  // Verifica se o benefício existe antes de desativar
  async deactivateEmployeeBenefit(id: string): Promise<IEmployeeBenefit> {
    try {
      const benefit = await employeeBenefitRepository.update(id, { 
        status: 'inactive',
        endDate: new Date()
      });
      
      if (!benefit) {
        throw new AppError('Employee benefit not found', 404);
      }
      return benefit;
    } catch (error) {
      logger.error(`Error deactivating employee benefit ${id}:`, error);
      throw error;
    }
  }

  // Verifica se o benefício existe antes de deletar
  async deleteEmployeeBenefit(id: string): Promise<void> {
    try {
      const result = await employeeBenefitRepository.delete(id);
      if (!result) {
        throw new AppError('Employee benefit not found', 404);
      }
    } catch (error) {
      logger.error(`Error deleting employee benefit ${id}:`, error);
      throw error;
    }
  }
}

export default new EmployeeBenefitService();