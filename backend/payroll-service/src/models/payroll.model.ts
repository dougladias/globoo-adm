import mongoose, { Schema, Document } from 'mongoose';

// Interface para o tipo de folha de pagamento
export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  contract: 'CLT' | 'PJ';
  month: number;
  year: number;
  baseSalary: number;
  overtimePay: number;
  overtimeHours: number;
  deductions: number;
  totalSalary: number;
  inss?: number;
  fgts?: number;
  irrf?: number;
  status: 'pending' | 'processed' | 'paid';
  processedAt: Date;
  paidAt?: Date;
}

// Schema para Folha de Pagamento
const PayrollSchema: Schema = new Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  contract: {
    type: String,
    enum: ['CLT', 'PJ'],
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100,
    index: true
  },
  baseSalary: {
    type: Number,
    required: true,
    min: 0
  },
  overtimePay: {
    type: Number,
    default: 0,
    min: 0
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    type: Number,
    required: true,
    min: 0
  },
  totalSalary: {
    type: Number,
    required: true,
    min: 0
  },
  inss: {
    type: Number,
    min: 0
  },
  fgts: {
    type: Number,
    min: 0
  },
  irrf: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending',
    index: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índice composto para evitar folhas de pagamento duplicadas
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

// Modelo Payroll
export default mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);