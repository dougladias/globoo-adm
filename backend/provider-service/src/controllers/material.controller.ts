import { Request, Response } from 'express';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto, UpdateMaterialDto, AdjustStockDto } from '../types/material.types';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

export class MaterialController {
  private service: MaterialService;

  constructor() {
    this.service = new MaterialService();
  }

  // Buscar todos os materiais
  getAllMaterials = async (req: Request, res: Response): Promise<void> => {
    try {
      // Processando filtros
      const filter: Record<string, any> = {};
      const { categoria, fornecedor } = req.query;
      
      if (categoria && typeof categoria === 'string') {
        filter.categoria = categoria;
      }
      
      if (fornecedor && typeof fornecedor === 'string') {
        filter.fornecedor = fornecedor;
      }
      
      const materials = await this.service.getAllMaterials(filter);
      res.status(200).json(materials);
    } catch (error) {
      logger.error('Erro no controller ao buscar materiais:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar material por ID
  getMaterialById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const material = await this.service.getMaterialById(id);
      res.status(200).json(material);
    } catch (error) {
      logger.error(`Erro no controller ao buscar material com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Criar material
  createMaterial = async (req: Request, res: Response): Promise<void> => {
    try {
      const materialData: CreateMaterialDto = req.body;
      const material = await this.service.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      logger.error('Erro no controller ao criar material:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Atualizar material
  updateMaterial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const materialData: UpdateMaterialDto = req.body;
      const material = await this.service.updateMaterial(id, materialData);
      res.status(200).json(material);
    } catch (error) {
      logger.error(`Erro no controller ao atualizar material com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Excluir material
  deleteMaterial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteMaterial(id);
      res.status(204).send();
    } catch (error) {
      logger.error(`Erro no controller ao excluir material com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Ajustar estoque
  adjustStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adjustmentData: AdjustStockDto = req.body;
      const material = await this.service.adjustStock(id, adjustmentData);
      res.status(200).json(material);
    } catch (error) {
      logger.error(`Erro no controller ao ajustar estoque do material com ID ${req.params.id}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar materiais com estoque baixo
  getLowStockMaterials = async (req: Request, res: Response): Promise<void> => {
    try {
      const materials = await this.service.getLowStockMaterials();
      res.status(200).json(materials);
    } catch (error) {
      logger.error('Erro no controller ao buscar materiais com estoque baixo:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar por categoria
  getMaterialsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoria } = req.params;
      const materials = await this.service.getMaterialsByCategory(categoria);
      res.status(200).json(materials);
    } catch (error) {
      logger.error(`Erro no controller ao buscar materiais da categoria ${req.params.categoria}:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };

  // Buscar por termo
  searchMaterials = async (req: Request, res: Response): Promise<void> => {
    try {
      const { term } = req.query;
      
      if (!term || typeof term !== 'string') {
        throw new AppError('Parâmetro term é obrigatório', 400);
      }
      
      const materials = await this.service.searchMaterials(term);
      res.status(200).json(materials);
    } catch (error) {
      logger.error('Erro no controller ao buscar materiais por termo:', error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof AppError ? error.message : 'Erro interno do servidor';
      res.status(statusCode).json({ message });
    }
  };
}

export default new MaterialController();