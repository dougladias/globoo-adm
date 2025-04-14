import mongoose, { Schema, Document } from "mongoose";

// Interface para o modelo de template de documento
export interface IDocumentTemplate extends Document {
  name: string;
  type: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  format: string;
  filePath?: string;
  isActive: boolean;
  category?: string;
  version: number;
}

const DocumentTemplateSchema = new Schema({
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
  description: { 
    type: String, 
    required: true 
  },
  createdBy: { 
    type: String, 
    required: true 
  },
  format: { 
    type: String, 
    required: true 
  },
  filePath: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  category: { 
    type: String 
  },
  version: { 
    type: Number, 
    default: 1 
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
DocumentTemplateSchema.index({ name: 'text', description: 'text' });
DocumentTemplateSchema.index({ isActive: 1 });
DocumentTemplateSchema.index({ category: 1 });

// Middleware para atualizar a data de atualização sempre que o documento for modificado
DocumentTemplateSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

export default mongoose.models.DocumentTemplate || 
  mongoose.model<IDocumentTemplate>("DocumentTemplate", DocumentTemplateSchema);