import mongoose, { Schema, Document } from 'mongoose';

// Interface para o documento Material
export interface IMaterial extends Document {
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  dataCriacao: Date;
  fornecedor?: string;
  descricao?: string;
  localizacao?: string;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  codigoInterno?: string;
  dataAtualizacao: Date;
}

// Schema do Material
const MaterialSchema = new Schema<IMaterial>(
  {
    categoria: {
      type: String,
      required: [true, 'Categoria é obrigatória'],
      trim: true
    },
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      index: true
    },
    quantidade: {
      type: Number,
      required: [true, 'Quantidade é obrigatória'],
      min: [0, 'Quantidade não pode ser negativa']
    },
    unidade: {
      type: String,
      required: [true, 'Unidade é obrigatória'],
      trim: true
    },
    preco: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: [0, 'Preço não pode ser negativo']
    },
    dataCriacao: {
      type: Date,
      default: Date.now
    },
    fornecedor: {
      type: String,
      trim: true
    },
    descricao: {
      type: String,
      trim: true
    },
    localizacao: {
      type: String,
      trim: true
    },
    estoqueMinimo: {
      type: Number,
      min: [0, 'Estoque mínimo não pode ser negativo']
    },
    estoqueMaximo: {
      type: Number,
      min: [0, 'Estoque máximo não pode ser negativo']
    },
    codigoInterno: {
      type: String,
      trim: true
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // Isso substituirá dataAtualizacao e usará createdAt/updatedAt padrão
  }
);

// Índices para otimizar consultas
MaterialSchema.index({ categoria: 1 });
MaterialSchema.index({ fornecedor: 1 });
MaterialSchema.index({ nome: 'text', descricao: 'text' });

// Pré-save hook para atualizar dataAtualizacao
MaterialSchema.pre('save', function(next) {
  this.dataAtualizacao = new Date();
  next();
});

const Material = mongoose.model<IMaterial>('Material', MaterialSchema);

export default Material;