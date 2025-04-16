import mongoose, { Schema, Document } from 'mongoose';

// Interface para itens da nota fiscal
export interface IInvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Interface para o documento Invoice
export interface IInvoice extends Document {
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
}

// Schema para itens da nota fiscal
const InvoiceItemSchema = new Schema<IInvoiceItem>({
  name: {
    type: String,
    required: [true, 'Nome do item é obrigatório'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantidade é obrigatória'],
    min: [0.01, 'Quantidade deve ser maior que zero']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Preço unitário é obrigatório'],
    min: [0, 'Preço unitário não pode ser negativo']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Preço total é obrigatório'],
    min: [0, 'Preço total não pode ser negativo']
  }
});

// Schema do Invoice
const InvoiceSchema = new Schema<IInvoice>(
  {
    number: {
      type: String,
      required: [true, 'Número da nota fiscal é obrigatório'],
      trim: true,
      unique: true
    },
    serie: {
      type: String,
      required: [true, 'Série da nota fiscal é obrigatória'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Tipo de nota fiscal é obrigatório'],
      enum: {
        values: ['entrada', 'saida'],
        message: 'Tipo deve ser "entrada" ou "saida"'
      }
    },
    date: {
      type: Date,
      required: [true, 'Data de emissão é obrigatória'],
      default: Date.now
    },
    dueDate: {
      type: Date
    },
    totalValue: {
      type: Number,
      required: [true, 'Valor total é obrigatório'],
      min: [0, 'Valor total não pode ser negativo']
    },
    supplierId: {
      type: String,
      trim: true
    },
    supplier: {
      type: String,
      required: [true, 'Nome do fornecedor é obrigatório'],
      trim: true
    },
    cnpj: {
      type: String,
      required: [true, 'CNPJ é obrigatório'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\d{14}$/.test(v.replace(/[^\d]/g, ''));
        },
        message: 'CNPJ inválido'
      }
    },
    description: {
      type: String,
      trim: true
    },
    filePath: {
      type: String,
      trim: true
    },
    items: [InvoiceItemSchema],
    status: {
      type: String,
      enum: {
        values: ['pendente', 'processado', 'pago', 'cancelado'],
        message: 'Status inválido'
      },
      default: 'pendente'
    },
    paymentMethod: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Índices para otimizar consultas
InvoiceSchema.index({ number: 1, serie: 1 }, { unique: true });
InvoiceSchema.index({ date: -1 });
InvoiceSchema.index({ supplier: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ type: 1 });

// Validação para garantir que o total dos itens seja igual ao total da nota
InvoiceSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('totalValue')) {
    const calculatedTotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Permite pequena margem de erro por causa de arredondamentos
    const diff = Math.abs(calculatedTotal - this.totalValue);
    if (diff > 0.01) {
      this.totalValue = calculatedTotal;
    }
  }
  
  // Normalizar CNPJ
  if (this.isModified('cnpj')) {
    this.cnpj = this.cnpj.replace(/[^\d]/g, '');
  }
  
  next();
});

const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;