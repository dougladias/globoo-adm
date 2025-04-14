import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AppError } from '../utils/error-handler';

// Função para validar tipo de arquivo
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar se o tipo MIME é permitido
  if (env.allowedPhotoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Tipo de arquivo não permitido. Tipos permitidos: ${env.allowedPhotoTypes.join(', ')}`, 400));
  }
};

// Criar configuração de armazenamento para fotos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), env.uploadDir, 'photos');
    
    // Garantir que o diretório exista
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniquePrefix}${ext}`);
  }
});

// Criar upload middleware para fotos
export const photoUpload = multer({
  storage: photoStorage,
  limits: {
    fileSize: env.maxPhotoSize // tamanho máximo
  },
  fileFilter
});