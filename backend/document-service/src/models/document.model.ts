import mongoose, { Schema, Document } from 'mongoose';

// Interface para o modelo de documento
export interface IDocument extends Document {
  name: string;
  type: string;
  employeeId: mongoose.Types.ObjectId;
  employee: string;
  department?: string;
  uploadDate: Date;
  expiryDate?: Date;
  size: number;
  fileType: string;
  path: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    required: true,
    index: true
  },
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Worker', 
    required: true,
    index: true
  },
  employee: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  expiryDate: { 
    type: Date 
  },
  size: { 
    type: Number 
  },
  fileType: { 
    type: String 
  },
  path: { 
    type: String, 
    required: true 
  },
  tags: [{ 
    type: String,
    trim: true
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
DocumentSchema.index({ name: 'text', employee: 'text', tags: 'text' });
DocumentSchema.index({ uploadDate: -1 });
DocumentSchema.index({ expiryDate: 1 });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);