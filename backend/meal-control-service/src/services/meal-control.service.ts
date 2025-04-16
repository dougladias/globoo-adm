import mealControlRepository from '../repositories/meal-control.repository';
import { IMealControl, IMealRecord } from '../models/meal-control.model';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import axios from 'axios';
import { env } from '../config/env';

class MealControlService {
  async getAllMealControls(filter = {}): Promise<IMealControl[]> {
    try {
      return await mealControlRepository.findAll(filter);
    } catch (error) {
      logger.error('Error getting all meal controls:', error);
      throw error;
    }
  }

  async getMealControlById(id: string): Promise<IMealControl> {
    try {
      const mealControl = await mealControlRepository.findById(id);
      if (!mealControl) {
        throw new AppError('Controle de refeição não encontrado', 404);
      }
      return mealControl;
    } catch (error) {
      logger.error(`Error getting meal control ${id}:`, error);
      throw error;
    }
  }

  async getMealControlByEmployeeId(employeeId: string): Promise<IMealControl> {
    try {
      const mealControl = await mealControlRepository.findByEmployeeId(employeeId);
      if (!mealControl) {
        throw new AppError('Controle de refeição não encontrado para este funcionário', 404);
      }
      return mealControl;
    } catch (error) {
      logger.error(`Error getting meal control for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async createMealControl(data: Partial<IMealControl>): Promise<IMealControl> {
    try {
      // Verificar campos obrigatórios
      if (!data.employeeId || !data.employeeName || !data.department) {
        throw new AppError('Campos obrigatórios: employeeId, employeeName, department', 400);
      }
      
      // Verificar se já existe um controle para este funcionário
      const existingControl = await mealControlRepository.findByEmployeeId(data.employeeId.toString());
      if (existingControl) {
        throw new AppError('Já existe um controle de refeição para este funcionário', 409);
      }
      
      // Verificar se o funcionário existe
      try {
        await axios.get(`${env.workerServiceUrl}/api/workers/${data.employeeId}`);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          throw new AppError('Funcionário não encontrado', 404);
        }
        logger.warn(`Não foi possível validar o funcionário ${data.employeeId}:`, error);
        // Continuar mesmo sem conseguir validar (para evitar falhas se o serviço de workers estiver indisponível)
      }
      
      // Criar novo controle
      return await mealControlRepository.create(data);
    } catch (error) {
      logger.error('Error creating meal control:', error);
      throw error;
    }
  }

  async updateMealControl(id: string, data: Partial<IMealControl>): Promise<IMealControl> {
    try {
      // Verificar se o controle existe
      const mealControl = await mealControlRepository.findById(id);
      if (!mealControl) {
        throw new AppError('Controle de refeição não encontrado', 404);
      }
      
      // Remover campos que não devem ser atualizados diretamente
      delete data.employeeId;
      delete data.mealRecords;
      
      // Atualizar controle
      const updatedControl = await mealControlRepository.update(id, data);
      if (!updatedControl) {
        throw new AppError('Erro ao atualizar controle de refeição', 500);
      }
      
      return updatedControl;
    } catch (error) {
      logger.error(`Error updating meal control ${id}:`, error);
      throw error;
    }
  }

  async deleteMealControl(id: string): Promise<void> {
    try {
      const result = await mealControlRepository.delete(id);
      if (!result) {
        throw new AppError('Controle de refeição não encontrado', 404);
      }
    } catch (error) {
      logger.error(`Error deleting meal control ${id}:`, error);
      throw error;
    }
  }

  async addMealRecord(id: string, recordData: Partial<IMealRecord>): Promise<IMealControl> {
    try {
      // Verificar campos obrigatórios
      if (!recordData.date || !recordData.mealType) {
        throw new AppError('Campos obrigatórios para registro de refeição: date, mealType', 400);
      }
      
      // Garantir que a data é um objeto Date
      if (typeof recordData.date === 'string') {
        recordData.date = new Date(recordData.date);
      }
      
      // Validar tipo de refeição
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(recordData.mealType)) {
        throw new AppError('Tipo de refeição inválido', 400);
      }
      
      // Adicionar registro
      const updatedControl = await mealControlRepository.addMealRecord(id, recordData as IMealRecord);
      if (!updatedControl) {
        throw new AppError('Controle de refeição não encontrado', 404);
      }
      
      return updatedControl;
    } catch (error) {
      logger.error(`Error adding meal record to control ${id}:`, error);
      throw error;
    }
  }

  async updateMealRecord(id: string, recordId: string, updateData: Partial<IMealRecord>): Promise<IMealControl> {
    try {
      // Se estiver atualizando a data, garantir que é um objeto Date
      if (updateData.date && typeof updateData.date === 'string') {
        updateData.date = new Date(updateData.date);
      }
      
      // Se estiver atualizando o tipo de refeição, validar
      if (updateData.mealType) {
        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validMealTypes.includes(updateData.mealType)) {
          throw new AppError('Tipo de refeição inválido', 400);
        }
      }
      
      // Atualizar registro
      const updatedControl = await mealControlRepository.updateMealRecord(id, recordId, updateData);
      if (!updatedControl) {
        throw new AppError('Controle de refeição ou registro não encontrado', 404);
      }
      
      return updatedControl;
    } catch (error) {
      logger.error(`Error updating meal record ${recordId} in control ${id}:`, error);
      throw error;
    }
  }

  async deleteMealRecord(id: string, recordId: string): Promise<IMealControl> {
    try {
      const updatedControl = await mealControlRepository.deleteMealRecord(id, recordId);
      if (!updatedControl) {
        throw new AppError('Controle de refeição ou registro não encontrado', 404);
      }
      
      return updatedControl;
    } catch (error) {
      logger.error(`Error deleting meal record ${recordId} from control ${id}:`, error);
      throw error;
    }
  }

  async getMealControlsByDepartment(department: string): Promise<IMealControl[]> {
    try {
      return await mealControlRepository.findByDepartment(department);
    } catch (error) {
      logger.error(`Error getting meal controls for department ${department}:`, error);
      throw error;
    }
  }

  async generateMealReport(startDate: Date, endDate: Date, department?: string): Promise<any> {
    try {
      // Buscar todos os controles de refeição com registros no período
      let mealControls = await mealControlRepository.findMealRecordsInDateRange(startDate, endDate);
      
      // Filtrar por departamento, se especificado
      if (department) {
        mealControls = mealControls.filter(control => control.department === department);
      }
      
      // Dados para o relatório
      const reportData = {
        period: {
          startDate,
          endDate
        },
        totalEmployees: mealControls.length,
        totalMealsProvided: 0,
        totalCost: 0,
        mealsByType: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0
        },
        mealsByDepartment: {} as Record<string, { count: number; cost: number }>
      };
      
      // Processar dados
      mealControls.forEach(control => {
        const departmentName = control.department || 'Sem departamento';
        
        // Inicializar contadores para o departamento, se necessário
        if (!reportData.mealsByDepartment[departmentName]) {
          reportData.mealsByDepartment[departmentName] = { count: 0, cost: 0 };
        }
        
        // Filtrar registros no período
        const recordsInPeriod = control.mealRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= startDate && recordDate <= endDate && record.provided;
        });
        
        // Processar registros
        recordsInPeriod.forEach(record => {
          // Contar refeição
          reportData.totalMealsProvided++;
          reportData.mealsByType[record.mealType]++;
          reportData.mealsByDepartment[departmentName].count++;
          
          // Somar custo
          const cost = record.cost || 0;
          reportData.totalCost += cost;
          reportData.mealsByDepartment[departmentName].cost += cost;
        });
      });
      
      return reportData;
    } catch (error) {
      logger.error(`Error generating meal report for period ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }
}

export default new MealControlService();