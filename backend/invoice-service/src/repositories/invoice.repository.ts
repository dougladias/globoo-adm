import Invoice, { IInvoice } from '../models/invoice.model';
import { CreateInvoiceDto, UpdateInvoiceDto, FilterInvoiceDto } from '../types/invoice.types';
import { AppError } from '../utils/error-handler';
import mongoose from 'mongoose';

export class InvoiceRepository {
  // Buscar todas as notas fiscais com filtros opcionais
  async findAll(filters: FilterInvoiceDto = {}): Promise<IInvoice[]> {
    const query: any = {};
    
    // Aplicar filtros
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.supplier) {
      query.supplier = { $regex: filters.supplier, $options: 'i' };
    }
    
    // Filtro de data
    if (filters.startDate || filters.endDate) {
      query.date = {};
      
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }
    
    // Filtro de valor
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      query.totalValue = {};
      
      if (filters.minValue !== undefined) {
        query.totalValue.$gte = filters.minValue;
      }
      
      if (filters.maxValue !== undefined) {
        query.totalValue.$lte = filters.maxValue;
      }
    }
    
    return Invoice.find(query).sort({ date: -1 });
  }

  // Buscar nota fiscal por ID
  async findById(id: string): Promise<IInvoice> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nota fiscal inválido', 400);
    }
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      throw new AppError('Nota fiscal não encontrada', 404);
    }
    
    return invoice;
  }

  // Buscar nota fiscal por número e série
  async findByNumberAndSerie(number: string, serie: string): Promise<IInvoice | null> {
    return Invoice.findOne({ number, serie });
  }

  // Criar nova nota fiscal
  async create(invoiceData: CreateInvoiceDto): Promise<IInvoice> {
    // Calcular valores totais dos itens se não forem fornecidos
    const processedItems = invoiceData.items.map(item => ({
      ...item,
      totalPrice: item.totalPrice || item.quantity * item.unitPrice
    }));
    
    // Calcular valor total da nota se não fornecido
    const totalValue = invoiceData.totalValue || 
      processedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    
    const invoice = new Invoice({
      ...invoiceData,
      items: processedItems,
      totalValue
    });
    
    await invoice.save();
    return invoice;
  }

  // Atualizar nota fiscal
  async update(id: string, invoiceData: UpdateInvoiceDto): Promise<IInvoice> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nota fiscal inválido', 400);
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { ...invoiceData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      throw new AppError('Nota fiscal não encontrada', 404);
    }
    
    return invoice;
  }

  // Atualizar status da nota fiscal
  async updateStatus(id: string, status: 'pendente' | 'processado' | 'pago' | 'cancelado'): Promise<IInvoice> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nota fiscal inválido', 400);
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      throw new AppError('Nota fiscal não encontrada', 404);
    }
    
    return invoice;
  }

  // Atualizar caminho do arquivo
  async updateFilePath(id: string, filePath: string): Promise<IInvoice> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nota fiscal inválido', 400);
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { filePath, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      throw new AppError('Nota fiscal não encontrada', 404);
    }
    
    return invoice;
  }

  // Excluir nota fiscal
  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nota fiscal inválido', 400);
    }
    
    const result = await Invoice.findByIdAndDelete(id);
    
    if (!result) {
      throw new AppError('Nota fiscal não encontrada', 404);
    }
  }

  // Buscar estatísticas de notas fiscais por período
  async getStatistics(startDate: Date, endDate: Date): Promise<any> {
    const stats = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          avgValue: { $avg: '$totalValue' }
        }
      }
    ]);
    
    // Formatar resposta
    const result = {
      period: { startDate, endDate },
      entrada: { count: 0, totalValue: 0, avgValue: 0 },
      saida: { count: 0, totalValue: 0, avgValue: 0 }
    };
    
    stats.forEach(item => {
      // Type guard ensures item._id is either 'entrada' or 'saida' here
      if (item._id === 'entrada' || item._id === 'saida') {
        // Asserting the type satisfies the index signature check
        result[item._id as 'entrada' | 'saida'] = { 
          count: item.count,
          totalValue: item.totalValue,
          avgValue: item.avgValue
        };
      }
    });
    
    return result;
  }
}