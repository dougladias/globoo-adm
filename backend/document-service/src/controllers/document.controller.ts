import { Request, Response, NextFunction } from 'express';
import documentService from '../services/document.service';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import fs from 'fs';

export const getAllDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documents = await documentService.getAllDocuments();
    res.status(200).json(documents);
  } catch (error) {
    logger.error('Error in getAllDocuments controller:', error);
    next(error);
  }
};

export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocumentById(id);
    res.status(200).json(document);
  } catch (error) {
    logger.error(`Error in getDocumentById controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const createDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se o arquivo foi enviado
    if (!req.file) {
      throw new AppError('Nenhum arquivo foi enviado', 400);
    }
    
    // Verificar campos obrigatórios
    const { employeeId, type, employee } = req.body;
    
    if (!employeeId || !type || !employee) {
      // Se faltar campos, exclui o arquivo
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      
      throw new AppError('Campos obrigatórios: employeeId, type, employee', 400);
    }
    
    // Processar tags
    let tags = [];
    if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      } else if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      }
    }
    
    // Processar data de expiração
    let expiryDate = undefined;
    if (req.body.expiryDate) {
      expiryDate = new Date(req.body.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        throw new AppError('Data de expiração inválida', 400);
      }
    }
    
    // Criar documento
    const document = await documentService.createDocument(
      {
        name: req.file.originalname,
        type,
        employeeId,
        employee,
        department: req.body.department,
        expiryDate,
        tags
      },
      req.file
    );
    
    res.status(201).json(document);
  } catch (error) {
    // Se houver erro e o arquivo existir, excluir
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    logger.error('Error in createDocument controller:', error);
    next(error);
  }
};

export const updateDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Processar tags
    let tags = undefined;
    if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      } else if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      }
    }
    
    // Processar data de expiração
    let expiryDate = undefined;
    if (req.body.expiryDate) {
      expiryDate = new Date(req.body.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        throw new AppError('Data de expiração inválida', 400);
      }
    }
    
    const documentData = {
      ...req.body,
      tags,
      expiryDate
    };
    
    // Remover campos que não devem ser atualizados
    delete documentData.path;
    delete documentData.fileType;
    delete documentData.size;
    delete documentData.uploadDate;
    
    const document = await documentService.updateDocument(id, documentData);
    res.status(200).json(document);
  } catch (error) {
    logger.error(`Error in updateDocument controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id);
    res.status(200).json({ message: 'Documento excluído com sucesso' });
  } catch (error) {
    logger.error(`Error in deleteDocument controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const getDocumentsByEmployeeId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const documents = await documentService.getDocumentsByEmployeeId(employeeId);
    res.status(200).json(documents);
  } catch (error) {
    logger.error(`Error in getDocumentsByEmployeeId controller for employee ${req.params.employeeId}:`, error);
    next(error);
  }
};

export const searchDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      throw new AppError('Query de pesquisa é obrigatória', 400);
    }
    
    const documents = await documentService.searchDocuments(query);
    res.status(200).json(documents);
  } catch (error) {
    logger.error(`Error in searchDocuments controller:`, error);
    next(error);
  }
};

export const getDocumentsByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const documents = await documentService.getDocumentsByType(type);
    res.status(200).json(documents);
  } catch (error) {
    logger.error(`Error in getDocumentsByType controller for type ${req.params.type}:`, error);
    next(error);
  }
};

export const getDocumentsByTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      throw new AppError('Tags são obrigatórias', 400);
    }
    
    let tagsArray: string[] = [];
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(tags)) {
      tagsArray = tags as string[];
    }
    
    const documents = await documentService.getDocumentsByTags(tagsArray);
    res.status(200).json(documents);
  } catch (error) {
    logger.error(`Error in getDocumentsByTags controller:`, error);
    next(error);
  }
};

export const getExpiringDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { days } = req.query;
    
    const daysNumber = days ? parseInt(days as string) : 30;
    
    if (isNaN(daysNumber) || daysNumber <= 0) {
      throw new AppError('Número de dias deve ser um número positivo', 400);
    }
    
    const documents = await documentService.getExpiringDocuments(daysNumber);
    res.status(200).json(documents);
  } catch (error) {
    logger.error(`Error in getExpiringDocuments controller:`, error);
    next(error);
  }
};

export const downloadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { filePath, fileName, mimeType } = await documentService.getDocumentFile(id);
    
    // Configurar cabeçalhos para download
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}`);
    
    // Enviar o arquivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error(`Error in downloadDocument controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const viewDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { filePath, fileName, mimeType } = await documentService.getDocumentFile(id);
    
    // Configurar cabeçalhos para visualização inline
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(fileName)}`);
    
    // Enviar o arquivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error(`Error in viewDocument controller for id ${req.params.id}:`, error);
    next(error);
  }
};