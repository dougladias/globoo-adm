import mongoose, { Schema, Document } from 'mongoose';

// Interface para registro de entrada/saída
export interface IEntry {
  entryTime: Date;
  leaveTime?: Date;
}

// Interface para o documento Visitor
export interface IVisitor extends Document {
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  photo?: string; // URL ou caminho para a foto
  logs: IEntry[];
  createdAt: Date;
  updatedAt: Date;
  isCurrentlyIn: boolean; // Virtual
}

// Schema do Visitor
const VisitorSchema = new Schema<IVisitor>({
  name: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true 
  },
  rg: { 
    type: String, 
    required: [true, 'RG é obrigatório'],
    trim: true 
  },
  cpf: { 
    type: String, 
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validação básica de CPF (apenas dígitos)
        return /^\d{11}$/.test(v.replace(/[^\d]/g, ''));
      },
      message: 'CPF inválido. Deve conter 11 dígitos numéricos.'
    }
  },
  phone: { 
    type: String, 
    required: [true, 'Telefone é obrigatório'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        // Validação básica de email
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Formato de email inválido'
    }
  },
  address: { 
    type: String, 
    required: [true, 'Endereço é obrigatório'],
    trim: true 
  },
  photo: { 
    type: String,
    trim: true
  },
  logs: [
    {
      entryTime: { 
        type: Date, 
        required: true,
        default: Date.now 
      },
      leaveTime: { 
        type: Date 
      }
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para otimizar consultas
VisitorSchema.index({ cpf: 1 }, { unique: true });
VisitorSchema.index({ name: 'text', email: 'text' });
VisitorSchema.index({ createdAt: -1 });

// Virtual para verificar se o visitante está nas dependências
VisitorSchema.virtual('isCurrentlyIn').get(function(this: IVisitor) {
  if (this.logs.length === 0) return false;
  const lastLog = this.logs[this.logs.length - 1];
  return lastLog.entryTime && !lastLog.leaveTime;
});

// Normalização de CPF antes de salvar
VisitorSchema.pre('save', function(next) {
  if (this.isModified('cpf')) {
    this.cpf = this.cpf.replace(/[^\d]/g, '');
  }
  next();
});

const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);

export default Visitor;