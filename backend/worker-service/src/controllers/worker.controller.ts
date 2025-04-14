import { Request, Response, NextFunction } from 'express';
import workerService from '../services/worker.service';
import logger from '../utils/logger';

// Controller para Gerenciamento de Funcionários
export const getAllWorkers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workers = await workerService.getAllWorkers();
    res.status(200).json(workers);
  } catch (error) {
    logger.error('Error in getAllWorkers controller:', error);
    next(error);
  }
};

// Controller para Registro de Ponto
export const getWorkerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const worker = await workerService.getWorkerById(id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.status(200).json(worker);
  } catch (error) {
    logger.error(`Error in getWorkerById controller for id ${req.params.id}:`, error);
    next(error);
  }
};

//  Controller para Criação de Funcionários
export const createWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const worker = await workerService.createWorker(req.body);
    res.status(201).json(worker);
  } catch (error) {
    logger.error('Error in createWorker controller:', error);
    next(error);
  }
};

// Controller para Atualização de Funcionários
export const updateWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedWorker = await workerService.updateWorker(id, updates);
    
    if (!updatedWorker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.status(200).json(updatedWorker);
  } catch (error) {
    logger.error(`Error in updateWorker controller for id ${req.params.id}:`, error);
    next(error);
  }
};

// Controller para Exclusão de Funcionários
export const deleteWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const worker = await workerService.deleteWorker(id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.status(200).json({ message: 'Worker deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteWorker controller for id ${req.params.id}:`, error);
    next(error);
  }
};

// Controller para Registro de Entrada
export const registerEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const worker = await workerService.registerEntry(id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.status(200).json(worker);
  } catch (error) {
    logger.error(`Error in registerEntry controller for id ${req.params.id}:`, error);
    next(error);
  }
};

// Controller para Registro de Saída
export const registerExit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const worker = await workerService.registerExit(id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found or no entry to update' });
    }
    
    res.status(200).json(worker);
  } catch (error) {
    logger.error(`Error in registerExit controller for id ${req.params.id}:`, error);
    next(error);
  }
};

// Controller para Registro de Faltas
export const registerAbsence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const worker = await workerService.registerAbsence(id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.status(200).json(worker);
  } catch (error) {
    logger.error(`Error in registerAbsence controller for id ${req.params.id}:`, error);
    next(error);
  }
};