import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AppError } from '../utils/error-handler';

// Função para validar tipo de arquivo
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Obter a extensão do arquivo
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  // Verificar se a extensão é permitida
  if (env.allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`Tipo de arquivo não permitido. Tipos permitidos: ${env.allowedFileTypes.join(', ')}`, 400));
  }
};

// Criar configuração de armazenamento para documentos
const documentStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(process.cwd(), env.uploadDir, 'documents');
      await fs.ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error as any, '');
    }
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniquePrefix}${ext}`);
  }
});

// Criar configuração de armazenamento para templates
const templateStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(process.cwd(), env.uploadDir, 'templates');
      await fs.ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error as any, '');
    }
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniquePrefix}${ext}`);
  }
});

// Criar upload middleware para documentos
export const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: env.maxFileSize // tamanho máximo
  },
  fileFilter
});

// Criar upload middleware para templates
export const templateUpload = multer({
  storage: templateStorage,
  limits: {
    fileSize: env.maxFileSize // tamanho máximo
  },
  fileFilter
});