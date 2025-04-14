import documentRepository from '../repositories/document.repository';
import { IDocument } from '../models/document.model';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import axios from 'axios';

// Custom function to check if an error is an Axios error
function isAxiosError(error: any): boolean {
  return error && error.isAxiosError === true;
}
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

class DocumentService {
  async getAllDocuments(filter = {}): Promise<IDocument[]> {
    try {
      return await documentRepository.findAll(filter);
    } catch (error: unknown) {
      logger.error('Error getting all documents:', error);
      throw error;
    }
  }
  

  async getDocumentById(id: string): Promise<IDocument> {
    try {
      const document = await documentRepository.findById(id);
      if (!document) {
        throw new AppError('Documento não encontrado', 404);
      }
      return document;
    } catch (error) {
      logger.error(`Error getting document ${id}:`, error);
      throw error;
    }
  }
  
  async createDocument(documentData: Partial<IDocument>, file: Express.Multer.File): Promise<IDocument> {
    try {
      // Verificar se o funcionário existe
      try {
        await axios.get(`${env.workerServiceUrl}/api/workers/${documentData.employeeId}`);
      } catch (error: any) {
        // Remover o arquivo se o funcionário não existir
        if (file && file.path) {
          fs.unlinkSync(file.path);
        }
  
        if (isAxiosError(error) && error.response?.status === 404) {
          throw new AppError('Funcionário não encontrado', 404);
        }
        // Se o erro não for 404, apenas logar o aviso
        logger.warn(`Não foi possível validar o funcionário ${documentData.employeeId}:`, error);
      }
      
      // Obter a extensão do arquivo
      const fileType = path.extname(file.originalname).substring(1);
      
      // Construir caminho relativo para o arquivo
      const relativePath = file.path.replace(process.cwd(), '').replace(/\\/g, '/');
      
      // Processar tags
      let tags: string[] = [];
      if (documentData.tags) {
        if (Array.isArray(documentData.tags)) {
          tags = documentData.tags;
        } else if (typeof documentData.tags === 'string') {
          tags = (documentData.tags as string).split(',').map(tag => tag.trim());
        }
      }
      
      // Criar novo documento
      const newDocument = await documentRepository.create({
        ...documentData,
        fileType,
        path: relativePath,
        size: file.size,
        tags
      });
      
      return newDocument;
    } catch (error) {
      logger.error('Error creating document:', error);
      throw error instanceof AppError ? error : new AppError('Erro ao criar documento', 500);
    }
  }

  async updateDocument(id: string, documentData: Partial<IDocument>): Promise<IDocument> {
    try {
      const document = await documentRepository.update(id, documentData);
      if (!document) {
        throw new AppError('Documento não encontrado', 404);
      }
      return document;
    } catch (error) {
      logger.error(`Error updating document ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao atualizar documento', 500);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const document = await documentRepository.findById(id);
      if (!document) {
        throw new AppError('Documento não encontrado', 404);
      }
      
      // Excluir o arquivo físico
      if (document.path) {
        const filePath = path.join(process.cwd(), document.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Excluir o registro no banco de dados
      await documentRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting document ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao excluir documento', 500);
    }
  }

  async getDocumentsByEmployeeId(employeeId: string): Promise<IDocument[]> {
    try {
      return await documentRepository.findByEmployeeId(employeeId);
    } catch (error) {
      logger.error(`Error getting documents for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async searchDocuments(query: string): Promise<IDocument[]> {
    try {
      return await documentRepository.search(query);
    } catch (error) {
      logger.error(`Error searching documents with query "${query}":`, error);
      throw error;
    }
  }

  async getDocumentsByType(type: string): Promise<IDocument[]> {
    try {
      return await documentRepository.findByType(type);
    } catch (error) {
      logger.error(`Error getting documents by type ${type}:`, error);
      throw error;
    }
  }

  async getDocumentsByTags(tags: string[]): Promise<IDocument[]> {
    try {
      return await documentRepository.findByTags(tags);
    } catch (error) {
      logger.error(`Error getting documents by tags ${tags.join(', ')}:`, error);
      throw error;
    }
  }

  async getExpiringDocuments(days: number = 30): Promise<IDocument[]> {
    try {
      return await documentRepository.findExpiring(days);
    } catch (error) {
      logger.error(`Error getting documents expiring in ${days} days:`, error);
      throw error;
    }
  }

  async getDocumentFile(id: string): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    try {
      const document = await documentRepository.findById(id);
      if (!document) {
        throw new AppError('Documento não encontrado', 404);
      }
      
      // Verificar se o arquivo existe
      const filePath = path.join(process.cwd(), document.path);
      if (!fs.existsSync(filePath)) {
        throw new AppError('Arquivo não encontrado no servidor', 404);
      }
      
      // Determinar o tipo MIME com base no tipo de arquivo
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'txt': 'text/plain'
      };
      
      const mimeType = mimeTypes[document.fileType.toLowerCase()] || 'application/octet-stream';
      
      return {
        filePath,
        fileName: document.name,
        mimeType
      };
    } catch (error) {
      logger.error(`Error getting document file ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao obter arquivo do documento', 500);
    }
  }
}


export default new DocumentService();