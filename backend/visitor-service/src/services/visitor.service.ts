import { VisitorRepository } from '../repositories/visitor.repository';
import { CreateVisitorDto, UpdateVisitorDto, VisitorResponse, mapToVisitorResponse } from '../types/visitor.types';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

export class VisitorService {
  private repository: VisitorRepository;

  constructor() {
    this.repository = new VisitorRepository();
  }

  // Buscar todos os visitantes
  async getAllVisitors(): Promise<VisitorResponse[]> {
    try {
      const visitors = await this.repository.findAll();
      return visitors.map(visitor => mapToVisitorResponse(visitor));
    } catch (error) {
      logger.error('Erro ao buscar visitantes:', error);
      throw error;
    }
  }

  // Buscar visitante por ID
  async getVisitorById(id: string): Promise<VisitorResponse> {
    try {
      const visitor = await this.repository.findById(id);
      return mapToVisitorResponse(visitor);
    } catch (error) {
      logger.error(`Erro ao buscar visitante com ID ${id}:`, error);
      throw error;
    }
  }

  // Criar novo visitante
  async createVisitor(visitorData: CreateVisitorDto): Promise<VisitorResponse> {
    try {
      // Verificar se já existe visitante com mesmo CPF
      const existingVisitor = await this.repository.findByCpf(visitorData.cpf);
      if (existingVisitor) {
        throw new AppError('Já existe um visitante cadastrado com este CPF', 409);
      }
      
      const visitor = await this.repository.create(visitorData);
      logger.info(`Novo visitante criado: ${visitor.name} (${visitor._id})`);
      return mapToVisitorResponse(visitor);
    } catch (error) {
      logger.error('Erro ao criar visitante:', error);
      throw error;
    }
  }

  // Atualizar visitante
  async updateVisitor(id: string, visitorData: UpdateVisitorDto): Promise<VisitorResponse> {
    try {
      // Se estiver atualizando o CPF, verificar se já existe
      if (visitorData.cpf) {
        const existingVisitor = await this.repository.findByCpf(visitorData.cpf);
        if (existingVisitor && existingVisitor._id && existingVisitor._id.toString() !== id) {
          throw new AppError('Já existe um visitante cadastrado com este CPF', 409);
        }
      }
      
      const visitor = await this.repository.update(id, visitorData);
      logger.info(`Visitante atualizado: ${visitor.name} (${visitor._id})`);
      return mapToVisitorResponse(visitor);
    } catch (error) {
      logger.error(`Erro ao atualizar visitante com ID ${id}:`, error);
      throw error;
    }
  }

  // Excluir visitante
  async deleteVisitor(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      logger.info(`Visitante excluído: ${id}`);
    } catch (error) {
      logger.error(`Erro ao excluir visitante com ID ${id}:`, error);
      throw error;
    }
  }

  // Registrar entrada de visitante
  async registerEntry(id: string): Promise<VisitorResponse> {
    try {
      const visitor = await this.repository.registerEntry(id);
      logger.info(`Entrada registrada: ${visitor.name} (${visitor._id})`);
      return mapToVisitorResponse(visitor);
    } catch (error) {
      logger.error(`Erro ao registrar entrada do visitante com ID ${id}:`, error);
      throw error;
    }
  }

  // Registrar saída de visitante
  async registerExit(id: string): Promise<VisitorResponse> {
    try {
      const visitor = await this.repository.registerExit(id);
      logger.info(`Saída registrada: ${visitor.name} (${visitor._id})`);
      return mapToVisitorResponse(visitor);
    } catch (error) {
      logger.error(`Erro ao registrar saída do visitante com ID ${id}:`, error);
      throw error;
    }
  }

  // Buscar visitantes ativos
  async getActiveVisitors(): Promise<VisitorResponse[]> {
    try {
      const visitors = await this.repository.findActive();
      return visitors.map(visitor => mapToVisitorResponse(visitor));
    } catch (error) {
      logger.error('Erro ao buscar visitantes ativos:', error);
      throw error;
    }
  }

  // Buscar visitantes por período
  async getVisitorsByDateRange(startDate: string, endDate: string): Promise<VisitorResponse[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError('Data inválida', 400);
      }
      
      const visitors = await this.repository.findByDateRange(start, end);
      return visitors.map(visitor => mapToVisitorResponse(visitor));
    } catch (error) {
      logger.error('Erro ao buscar visitantes por período:', error);
      throw error;
    }
  }

  // Buscar visitantes por termo
  async searchVisitors(term: string): Promise<VisitorResponse[]> {
    try {
      const visitors = await this.repository.search(term);
      return visitors.map(visitor => mapToVisitorResponse(visitor));
    } catch (error) {
      logger.error(`Erro ao buscar visitantes com termo "${term}":`, error);
      throw error;
    }
  }
}