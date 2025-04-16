import { IInvoice, IInvoiceItem } from '../models/invoice.model';

// DTO para item da nota fiscal
export interface InvoiceItemDto {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number; // Opcional no input, calculado automaticamente
}

// DTO para criar uma nova nota fiscal
export interface CreateInvoiceDto {
  number: string;
  serie: string;
  type: 'entrada' | 'saida';
  date: Date | string;
  dueDate?: Date | string;
  totalValue?: number; // Opcional no input, calculado automaticamente
  supplierId?: string;
  supplier: string;
  cnpj: string;
  description?: string;
  items: InvoiceItemDto[];
  status?: 'pendente' | 'processado' | 'pago' | 'cancelado';
  paymentMethod?: string;
  notes?: string;
  createdBy?: string;
}

// DTO para atualizar uma nota fiscal
export interface UpdateInvoiceDto {
  status?: 'pendente' | 'processado' | 'pago' | 'cancelado';
  dueDate?: Date | string;
  paymentMethod?: string;
  notes?: string;
  description?: string;
}

// DTO para filtrar notas fiscais
export interface FilterInvoiceDto {
  startDate?: Date | string;
  endDate?: Date | string;
  supplier?: string;
  status?: 'pendente' | 'processado' | 'pago' | 'cancelado';
  type?: 'entrada' | 'saida';
  minValue?: number;
  maxValue?: number;
}

// DTO para cancelar nota fiscal
export interface CancelInvoiceDto {
  reason: string;
}

// Interface para resposta da API
export interface InvoiceResponse {
  id: string;
  number: string;
  serie: string;
  type: 'entrada' | 'saida';
  date: Date;
  dueDate?: Date;
  totalValue: number;
  supplierId?: string;
  supplier: string;
  cnpj: string;
  description?: string;
  filePath?: string;
  items: IInvoiceItem[];
  status: 'pendente' | 'processado' | 'pago' | 'cancelado';
  paymentMethod?: string;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  downloadUrl?: string; // URL para download do arquivo, se houver
}

// Mapper: Converte MongoDB Document para DTO de resposta
export const mapToInvoiceResponse = (invoice: IInvoice, baseUrl?: string): InvoiceResponse => {
  const response: InvoiceResponse = {
    id: (invoice._id as { toString(): string }).toString(),
    number: invoice.number,
    serie: invoice.serie,
    type: invoice.type,
    date: invoice.date,
    dueDate: invoice.dueDate,
    totalValue: invoice.totalValue,
    supplierId: invoice.supplierId,
    supplier: invoice.supplier,
    cnpj: invoice.cnpj,
    description: invoice.description,
    filePath: invoice.filePath,
    items: invoice.items,
    status: invoice.status,
    paymentMethod: invoice.paymentMethod,
    notes: invoice.notes,
    createdBy: invoice.createdBy,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt
  };

  // Adicionar URL de download se o arquivo existir e baseUrl for fornecido
  if (invoice.filePath && baseUrl) {
    response.downloadUrl = `${baseUrl}/api/invoices/download/${invoice._id}`;
  }

  return response;
};