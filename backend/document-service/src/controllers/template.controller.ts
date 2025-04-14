import { Request, Response, NextFunction } from 'express';
import templateService from '../services/template.service';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import fs from 'fs';

export const getAllTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { includeInactive } = req.query;
    const templates = await templateService.getAllTemplates(includeInactive === 'true');
    res.status(200).json(templates);
  } catch (error) {
    logger.error('Error in getAllTemplates controller:', error);
    next(error);
  }
};

export const getTemplateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const template = await templateService.getTemplateById(id);
    res.status(200).json(template);
  } catch (error) {
    logger.error(`Error in getTemplateById controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar campos obrigatórios
    const { name, type, description, createdBy, format } = req.body;
    
    if (!name || !type || !description || !createdBy) {
      // Se faltar campos, exclui o arquivo se existir
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      
      throw new AppError('Campos obrigatórios: name, type, description, createdBy', 400);
    }
    
    // Se não tiver arquivo, precisa informar o formato
    if (!req.file && !format) {
      throw new AppError('Formato do documento é obrigatório quando não há arquivo', 400);
    }
    
    // Criar template
    const template = await templateService.createTemplate(
      {
        name,
        type,
        description,
        createdBy,
        format: req.file ? undefined : format,
        category: req.body.category
      },
      req.file
    );
    
    res.status(201).json(template);
  } catch (error) {
    // Se houver erro e o arquivo existir, excluir
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    logger.error('Error in createTemplate controller:', error);
    next(error);
  }
};

export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Remover campos que não devem ser atualizados
    const templateData = { ...req.body };
    delete templateData.filePath;
    delete templateData.createdAt;
    delete templateData.format;
    delete templateData.version;
    
    const template = await templateService.updateTemplate(id, templateData);
    res.status(200).json(template);
  } catch (error) {
    logger.error(`Error in updateTemplate controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await templateService.deleteTemplate(id);
    res.status(200).json({ message: 'Modelo excluído com sucesso' });
  } catch (error) {
    logger.error(`Error in deleteTemplate controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deactivateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const template = await templateService.deactivateTemplate(id);
    res.status(200).json({
      message: 'Modelo desativado com sucesso',
      template
    });
  } catch (error) {
    logger.error(`Error in deactivateTemplate controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const searchTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      throw new AppError('Query de pesquisa é obrigatória', 400);
    }
    
    const templates = await templateService.searchTemplates(query);
    res.status(200).json(templates);
  } catch (error) {
    logger.error(`Error in searchTemplates controller:`, error);
    next(error);
  }
};

export const getTemplatesByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const templates = await templateService.getTemplatesByType(type);
      res.status(200).json(templates);
    } catch (error) {
      logger.error(`Error in getTemplatesByType controller for type ${req.params.type}:`, error);
      next(error);
    }
  };
  
  export const getTemplatesByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const templates = await templateService.getTemplatesByCategory(category);
      res.status(200).json(templates);
    } catch (error) {
      logger.error(`Error in getTemplatesByCategory controller for category ${req.params.category}:`, error);
      next(error);
    }
  };
  
  export const duplicateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { createdBy, name } = req.body;
      
      if (!createdBy) {
        throw new AppError('Campo createdBy é obrigatório', 400);
      }
      
      const template = await templateService.duplicateTemplate(id, { createdBy, name });
      res.status(201).json({
        message: 'Modelo duplicado com sucesso',
        template
      });
    } catch (error) {
      logger.error(`Error in duplicateTemplate controller for id ${req.params.id}:`, error);
      next(error);
    }
  };
  
  export const downloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { filePath, fileName, mimeType } = await templateService.getTemplateFile(id);
      
      // Configurar cabeçalhos para download
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}`);
      
      // Enviar o arquivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      logger.error(`Error in downloadTemplate controller for id ${req.params.id}:`, error);
      next(error);
    }
  };
  
  export const viewTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { filePath, fileName, mimeType } = await templateService.getTemplateFile(id);
      
      // Configurar cabeçalhos para visualização inline
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(fileName)}`);
      
      // Enviar o arquivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      logger.error(`Error in viewTemplate controller for id ${req.params.id}:`, error);
      next(error);
    }
  };