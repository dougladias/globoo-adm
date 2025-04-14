import templateRepository from '../repositories/template.repository';
import { IDocumentTemplate } from '../models/template.model';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class TemplateService {
  async getAllTemplates(includeInactive: boolean = false): Promise<IDocumentTemplate[]> {
    try {
      const filter = includeInactive ? {} : { isActive: true };
      return await templateRepository.findAll(filter);
    } catch (error) {
      logger.error('Error getting all templates:', error);
      throw error;
    }
  }

  async getTemplateById(id: string): Promise<IDocumentTemplate> {
    try {
      const template = await templateRepository.findById(id);
      if (!template) {
        throw new AppError('Modelo não encontrado', 404);
      }
      return template;
    } catch (error) {
      logger.error(`Error getting template ${id}:`, error);
      throw error;
    }
  }

  async createTemplate(templateData: Partial<IDocumentTemplate>, file?: Express.Multer.File): Promise<IDocumentTemplate> {
    try {
      let filePath = undefined;
      
      // Se houver arquivo, preparar o caminho
      if (file) {
        // Construir caminho relativo para o arquivo
        filePath = file.path.replace(process.cwd(), '').replace(/\\/g, '/');
      }
      
      // Criar novo template
      const newTemplate = await templateRepository.create({
        ...templateData,
        filePath,
        format: file ? path.extname(file.originalname).substring(1) : templateData.format
      });
      
      return newTemplate;
    } catch (error) {
      // Se houve erro e um arquivo foi salvo, excluir
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      logger.error('Error creating template:', error);
      throw error instanceof AppError ? error : new AppError('Erro ao criar modelo', 500);
    }
  }

  async updateTemplate(id: string, templateData: Partial<IDocumentTemplate>): Promise<IDocumentTemplate> {
    try {
      const template = await templateRepository.update(id, templateData);
      if (!template) {
        throw new AppError('Modelo não encontrado', 404);
      }
      return template;
    } catch (error) {
      logger.error(`Error updating template ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao atualizar modelo', 500);
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      const template = await templateRepository.findById(id);
      if (!template) {
        throw new AppError('Modelo não encontrado', 404);
      }
      
      // Excluir o arquivo físico, se existir
      if (template.filePath) {
        const filePath = path.join(process.cwd(), template.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Excluir o registro no banco de dados
      await templateRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting template ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao excluir modelo', 500);
    }
  }

  async deactivateTemplate(id: string): Promise<IDocumentTemplate> {
    try {
      const template = await templateRepository.deactivate(id);
      if (!template) {
        throw new AppError('Modelo não encontrado', 404);
      }
      return template;
    } catch (error) {
      logger.error(`Error deactivating template ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao desativar modelo', 500);
    }
  }

  async searchTemplates(query: string): Promise<IDocumentTemplate[]> {
    try {
      return await templateRepository.search(query);
    } catch (error) {
      logger.error(`Error searching templates with query "${query}":`, error);
      throw error;
    }
  }

  async getTemplatesByType(type: string): Promise<IDocumentTemplate[]> {
    try {
      return await templateRepository.findByType(type);
    } catch (error) {
      logger.error(`Error getting templates by type ${type}:`, error);
      throw error;
    }
  }

  async getTemplatesByCategory(category: string): Promise<IDocumentTemplate[]> {
    try {
      return await templateRepository.findByCategory(category);
    } catch (error) {
      logger.error(`Error getting templates by category ${category}:`, error);
      throw error;
    }
  }

  async duplicateTemplate(id: string, userData: { createdBy: string; name?: string }): Promise<IDocumentTemplate> {
    try {
      // Buscar modelo original
      const originalTemplate = await templateRepository.findById(id);
      if (!originalTemplate) {
        throw new AppError('Modelo não encontrado', 404);
      }
      
      // Duplicar arquivo, se existir
      let newFilePath = undefined;
      if (originalTemplate.filePath) {
        const originalFilePath = path.join(process.cwd(), originalTemplate.filePath);
        
        // Verificar se o arquivo existe
        if (fs.existsSync(originalFilePath)) {
          // Gerar um novo nome de arquivo
          const fileId = uuidv4();
          const extension = path.extname(originalFilePath);
          const newFileName = `${fileId}${extension}`;
          
          // Diretório para o novo arquivo
          const uploadDir = path.join(process.cwd(), 'public/uploads/templates');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          // Caminho para o novo arquivo
          const newFilePathFull = path.join(uploadDir, newFileName);
          
          // Copiar o arquivo
          fs.copyFileSync(originalFilePath, newFilePathFull);
          
          // Caminho relativo para o banco de dados
          newFilePath = `/uploads/templates/${newFileName}`;
        }
      }
      
      // Duplicar o modelo no banco de dados
      const newTemplate = await templateRepository.duplicate(id, {
        name: userData.name,
        createdBy: userData.createdBy,
        filePath: newFilePath
      });
      
      if (!newTemplate) {
        // Se não criou o modelo, mas criou o arquivo, excluir
        if (newFilePath) {
          const filePath = path.join(process.cwd(), newFilePath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        
        throw new AppError('Erro ao duplicar modelo', 500);
      }
      
      return newTemplate;
    } catch (error) {
      logger.error(`Error duplicating template ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao duplicar modelo', 500);
    }
  }

  async getTemplateFile(id: string): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    try {
      const template = await templateRepository.findById(id);
      if (!template) {
        throw new AppError('Modelo não encontrado', 404);
      }
      
      // Verificar se o arquivo existe
      if (!template.filePath) {
        throw new AppError('Arquivo não encontrado', 404);
      }
      
      const filePath = path.join(process.cwd(), template.filePath);
      if (!fs.existsSync(filePath)) {
        throw new AppError('Arquivo não encontrado no servidor', 404);
      }
      
      // Determinar o tipo MIME com base no formato do modelo
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain'
      };
      
      const mimeType = mimeTypes[template.format.toLowerCase()] || 'application/octet-stream';
      
      return {
        filePath,
        fileName: template.name,
        mimeType
      };
    } catch (error) {
      logger.error(`Error getting template file ${id}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao obter arquivo do modelo', 500);
    }
  }
}

export default new TemplateService();