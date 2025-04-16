import { IVisitor } from '../models/visitor.model';

// DTO para criar um novo visitante
export interface CreateVisitorDto {
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  photo?: string;
}

// DTO para atualizar um visitante
export interface UpdateVisitorDto {
  name?: string;
  rg?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  photo?: string;
}

// Interface para resposta da API
export interface VisitorResponse {
  id: string;
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  photo?: string;
  lastEntry?: {
    entryTime: Date;
    leaveTime?: Date;
  };
  isCurrentlyIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mapper: Converte MongoDB Document para DTO de resposta
export const mapToVisitorResponse = (visitor: IVisitor): VisitorResponse => {
  const lastLog = visitor.logs.length > 0 
    ? visitor.logs[visitor.logs.length - 1] 
    : undefined;
  
  return {
    id: visitor.id.toString(),
    name: visitor.name,
    rg: visitor.rg,
    cpf: visitor.cpf,
    phone: visitor.phone,
    email: visitor.email,
    address: visitor.address,
    photo: visitor.photo,
    lastEntry: lastLog ? {
      entryTime: lastLog.entryTime,
      leaveTime: lastLog.leaveTime
    } : undefined,
    isCurrentlyIn: visitor.isCurrentlyIn,
    createdAt: visitor.createdAt,
    updatedAt: visitor.updatedAt
  };
};