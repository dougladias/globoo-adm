import Visitor, { IVisitor } from '../models/visitor.model';
import { CreateVisitorDto, UpdateVisitorDto } from '../types/visitor.types';
import { AppError } from '../utils/error-handler';
import mongoose from 'mongoose';

export class VisitorRepository {
  // Buscar todos os visitantes
  async findAll(): Promise<IVisitor[]> {
    return Visitor.find().sort({ name: 1 });
  }

  // Buscar visitante por ID
  async findById(id: string): Promise<IVisitor> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de visitante inválido', 400);
    }
    
    const visitor = await Visitor.findById(id);
    
    if (!visitor) {
      throw new AppError('Visitante não encontrado', 404);
    }
    
    return visitor;
  }

  // Buscar visitante por CPF
  async findByCpf(cpf: string): Promise<IVisitor | null> {
    // Normalizar CPF (remover caracteres não numéricos)
    const normalizedCpf = cpf.replace(/[^\d]/g, '');
    return Visitor.findOne({ cpf: normalizedCpf });
  }

  // Criar novo visitante
  async create(visitorData: CreateVisitorDto): Promise<IVisitor> {
    const visitor = new Visitor(visitorData);
    await visitor.save();
    return visitor;
  }

  // Atualizar visitante
  async update(id: string, visitorData: UpdateVisitorDto): Promise<IVisitor> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de visitante inválido', 400);
    }
    
    const visitor = await Visitor.findByIdAndUpdate(
      id,
      visitorData,
      { new: true, runValidators: true }
    );
    
    if (!visitor) {
      throw new AppError('Visitante não encontrado', 404);
    }
    
    return visitor;
  }

  // Excluir visitante
  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de visitante inválido', 400);
    }
    
    const result = await Visitor.findByIdAndDelete(id);
    
    if (!result) {
      throw new AppError('Visitante não encontrado', 404);
    }
  }

  // Registrar entrada de visitante
  async registerEntry(id: string): Promise<IVisitor> {
    const visitor = await this.findById(id);
    
    // Verificar se há uma entrada sem saída
    if (visitor.isCurrentlyIn) {
      throw new AppError('Visitante já possui entrada registrada sem saída', 400);
    }
    
    // Adicionar novo registro de entrada
    visitor.logs.push({ entryTime: new Date() });
    await visitor.save();
    
    return visitor;
  }

  // Registrar saída de visitante
  async registerExit(id: string): Promise<IVisitor> {
    const visitor = await this.findById(id);
    
    if (!visitor.isCurrentlyIn) {
      throw new AppError('Visitante não possui entrada registrada', 400);
    }
    
    // Atualizar último registro com a data de saída
    const lastLog = visitor.logs[visitor.logs.length - 1];
    lastLog.leaveTime = new Date();
    
    await visitor.save();
    return visitor;
  }

  // Buscar visitantes ativos (sem registro de saída)
  async findActive(): Promise<IVisitor[]> {
    return Visitor.find({
      logs: {
        $elemMatch: {
          entryTime: { $exists: true },
          leaveTime: { $exists: false }
        }
      }
    }).sort({ 'logs.entryTime': -1 });
  }

  // Buscar por período de data
  async findByDateRange(startDate: Date, endDate: Date): Promise<IVisitor[]> {
    return Visitor.find({
      'logs.entryTime': {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ 'logs.entryTime': -1 });
  }

  // Buscar por termo (nome, CPF, email)
  async search(term: string): Promise<IVisitor[]> {
    const normalizedTerm = term.trim();
    
    // Se o termo parece um CPF, busca exata
    const isCpf = /^\d{11}$/.test(normalizedTerm.replace(/[^\d]/g, ''));
    
    if (isCpf) {
      const normalizedCpf = normalizedTerm.replace(/[^\d]/g, '');
      const visitor = await Visitor.findOne({ cpf: normalizedCpf });
      return visitor ? [visitor] : [];
    }
    
    // Caso contrário, busca por nome ou email
    return Visitor.find({
      $or: [
        { name: { $regex: normalizedTerm, $options: 'i' } },
        { email: { $regex: normalizedTerm, $options: 'i' } },
        { rg: { $regex: normalizedTerm, $options: 'i' } }
      ]
    }).sort({ name: 1 });
  }
}