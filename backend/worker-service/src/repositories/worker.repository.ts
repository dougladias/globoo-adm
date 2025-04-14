import Worker, { IWorker } from '../models/worker.model';
import { FilterQuery } from 'mongoose';
import logger from '../utils/logger';

//  retorna todos os trabalhadores
class WorkerRepository {
  async findAll(filter: FilterQuery<IWorker> = {}): Promise<IWorker[]> {
    try {
      return await Worker.find(filter);
    } catch (error) {
      logger.error('Error finding workers:', error);
      throw error;
    }
  }

  // retorna trabalhador por id
  async findById(id: string): Promise<IWorker | null> {
    try {
      return await Worker.findById(id);
    } catch (error) {
      logger.error(`Error finding worker by id ${id}:`, error);
      throw error;
    }
  }

  // cria trabalhador
  async create(workerData: Partial<IWorker>): Promise<IWorker> {
    try {
      const worker = new Worker(workerData);
      return await worker.save();
    } catch (error) {
      logger.error('Error creating worker:', error);
      throw error;
    }
  }

  // Atualiza trabalhador por id
  async update(id: string, workerData: Partial<IWorker>): Promise<IWorker | null> {
    try {
      return await Worker.findByIdAndUpdate(
        id,
        workerData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating worker ${id}:`, error);
      throw error;
    }
  }

  // Deleta trabalhador por id
  async delete(id: string): Promise<IWorker | null> {
    try {
      return await Worker.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting worker ${id}:`, error);
      throw error;
    }
  }

  // Adiciona log ao trabalhador
  async addLog(id: string, logData: any): Promise<IWorker | null> {
    try {
      return await Worker.findByIdAndUpdate(
        id,
        { $push: { logs: logData } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error adding log to worker ${id}:`, error);
      throw error;
    }
  }

  // Atualiza o último log do trabalhador
  async updateLastLog(id: string, logData: any): Promise<IWorker | null> {
    try {
      const worker = await Worker.findById(id);
      if (worker && worker.logs.length > 0) {
        const lastLogIndex = worker.logs.length - 1;
        const updateQuery = {
          [`logs.${lastLogIndex}.leaveTime`]: logData.leaveTime
        };
        
        return await Worker.findByIdAndUpdate(
          id,
          { $set: updateQuery },
          { new: true, runValidators: true }
        );
      }
      return null;
    } catch (error) {
      logger.error(`Error updating last log for worker ${id}:`, error);
      throw error;
    }
  }
}

export default new WorkerRepository();