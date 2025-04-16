import { Request, Response } from 'express';
import { VisitorService } from '../services/visitor.service';
import { CreateVisitorDto, UpdateVisitorDto } from '../types/visitor.types';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

export class VisitorController {
  private service: VisitorService;

  constructor() {
    this.service = new VisitorService();
  }

  // Buscar todos os visitantes
  getAllVisitors = async (req: Request, res: Response): Promise<void> => {
    try {
      const visitors = await this.service.getAllVisitors();
      res.status(200).json(visitors);
    } catch (error) {
      logger.error('Erro no controller ao buscar visitantes:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar visitante por ID
  getVisitorById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const visitor = await this.service.getVisitorById(id);
      res.status(200).json(visitor);
    } catch (error) {
      logger.error(`Erro no controller ao buscar visitante com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Criar visitante
  createVisitor = async (req: Request, res: Response): Promise<void> => {
    try {
      const visitorData: CreateVisitorDto = req.body;
      const visitor = await this.service.createVisitor(visitorData);
      res.status(201).json(visitor);
    } catch (error) {
      logger.error('Erro no controller ao criar visitante:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Atualizar visitante
  updateVisitor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const visitorData: UpdateVisitorDto = req.body;
      const visitor = await this.service.updateVisitor(id, visitorData);
      res.status(200).json(visitor);
    } catch (error) {
      logger.error(`Erro no controller ao atualizar visitante com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Excluir visitante
  deleteVisitor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteVisitor(id);
      res.status(204).send();
    } catch (error) {
      logger.error(`Erro no controller ao excluir visitante com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Registrar entrada
  registerEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const visitor = await this.service.registerEntry(id);
      res.status(200).json(visitor);
    } catch (error) {
      logger.error(`Erro no controller ao registrar entrada do visitante com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Registrar saída
  registerExit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const visitor = await this.service.registerExit(id);
      res.status(200).json(visitor);
    } catch (error) {
      logger.error(`Erro no controller ao registrar saída do visitante com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar visitantes ativos
  getActiveVisitors = async (req: Request, res: Response): Promise<void> => {
    try {
      const visitors = await this.service.getActiveVisitors();
      res.status(200).json(visitors);
    } catch (error) {
      logger.error('Erro no controller ao buscar visitantes ativos:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar por período
  getVisitorsByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        throw new AppError('Parâmetros startDate e endDate são obrigatórios', 400);
      }
      
      const visitors = await this.service.getVisitorsByDateRange(startDate, endDate);
      res.status(200).json(visitors);
    } catch (error) {
      logger.error('Erro no controller ao buscar visitantes por período:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar por termo
  searchVisitors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { term } = req.query;
      
      if (!term || typeof term !== 'string') {
        throw new AppError('Parâmetro term é obrigatório', 400);
      }
      
      const visitors = await this.service.searchVisitors(term);
      res.status(200).json(visitors);
    } catch (error) {
      logger.error('Erro no controller ao buscar visitantes por termo:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };
}

export default new VisitorController();