import workerRepository from '../repositories/worker.repository';
import { IWorker } from '../models/worker.model';
import logger from '../utils/logger';

// WorkerService
class WorkerService {
  async getAllWorkers(filter = {}): Promise<IWorker[]> {
    try {
      return await workerRepository.findAll(filter);
    } catch (error) {
      logger.error('Error getting all workers:', error);
      throw error;
    }
  }
// async obterTodosTrabalhadoresPorData(data: Date): 
  async getWorkerById(id: string): Promise<IWorker | null> {
    try {
      return await workerRepository.findById(id);
    } catch (error) {
      logger.error(`Error getting worker ${id}:`, error);
      throw error;
    }
  }
  
// async obterTrabalhadorPorData(data: Date): 
  async createWorker(workerData: Partial<IWorker>): Promise<IWorker> {
    try {
      return await workerRepository.create(workerData);
    } catch (error) {
      logger.error('Error creating worker:', error);
      throw error;
    }
  }

  // async criarTrabalhador trabalhador: 
  async updateWorker(id: string, workerData: Partial<IWorker>): Promise<IWorker | null> {
    try {
      return await workerRepository.update(id, workerData);
    } catch (error) {
      logger.error(`Error updating worker ${id}:`, error);
      throw error;
    }
  }

    // async atualizarTrabalhador trabalhador:
  async deleteWorker(id: string): Promise<IWorker | null> {
    try {
      return await workerRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting worker ${id}:`, error);
      throw error;
    }
  }

  // async deletarTrabalhador trabalhador:
  async registerEntry(id: string): Promise<IWorker | null> {
    try {
      const logData = {
        entryTime: new Date(),
        date: new Date()
      };
      return await workerRepository.addLog(id, logData);
    } catch (error) {
      logger.error(`Error registering entry for worker ${id}:`, error);
      throw error;
    }
  }

  // async registrarEntrada trabalhador:
  async registerExit(id: string): Promise<IWorker | null> {
    try {
      const logData = {
        leaveTime: new Date()
      };
      return await workerRepository.updateLastLog(id, logData);
    } catch (error) {
      logger.error(`Error registering exit for worker ${id}:`, error);
      throw error;
    }
  }

  // async registrarSaida trabalhador:
  async registerAbsence(id: string): Promise<IWorker | null> {
    try {
      const logData = {
        faltou: true,
        date: new Date()
      };
      return await workerRepository.addLog(id, logData);
    } catch (error) {
      logger.error(`Error registering absence for worker ${id}:`, error);
      throw error;
    }
  }
}

export default new WorkerService();