import { IMaterial } from '../models/material.model';

// DTO para criar um novo material
export interface CreateMaterialDto {
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  fornecedor?: string;
  descricao?: string;
  localizacao?: string;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  codigoInterno?: string;
}

// DTO para atualizar um material
export interface UpdateMaterialDto {
  categoria?: string;
  nome?: string;
  quantidade?: number;
  unidade?: string;
  preco?: number;
  fornecedor?: string;
  descricao?: string;
  localizacao?: string;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  codigoInterno?: string;
}

// DTO para ajustar estoque
export interface AdjustStockDto {
  quantidade: number;
  motivo: string;
  tipo: 'entrada' | 'saida';
}

// Interface para resposta da API
export interface MaterialResponse {
  id: string;
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  valorTotal: number; // Calculado: quantidade * preco
  dataCriacao: Date;
  fornecedor?: string;
  descricao?: string;
  localizacao?: string;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  codigoInterno?: string;
  dataAtualizacao: Date;
  statusEstoque: 'normal' | 'baixo' | 'excedente'; // Calculado com base em estoqueMinimo/estoqueMaximo
}

// Mapper: Converte MongoDB Document para DTO de resposta
export const mapToMaterialResponse = (material: IMaterial & { _id: { toString(): string } }): MaterialResponse => {
  let statusEstoque: 'normal' | 'baixo' | 'excedente' = 'normal';
  
  // Calcular status do estoque
  if (material.estoqueMinimo !== undefined && material.quantidade < material.estoqueMinimo) {
    statusEstoque = 'baixo';
  } else if (material.estoqueMaximo !== undefined && material.quantidade > material.estoqueMaximo) {
    statusEstoque = 'excedente';
  }
  
  return {
    id: material._id.toString(),
    categoria: material.categoria,
    nome: material.nome,
    quantidade: material.quantidade,
    unidade: material.unidade,
    preco: material.preco,
    valorTotal: material.quantidade * material.preco,
    dataCriacao: material.dataCriacao,
    fornecedor: material.fornecedor,
    descricao: material.descricao,
    localizacao: material.localizacao,
    estoqueMinimo: material.estoqueMinimo,
    estoqueMaximo: material.estoqueMaximo,
    codigoInterno: material.codigoInterno,
    dataAtualizacao: material.dataAtualizacao,
    statusEstoque
  };
};