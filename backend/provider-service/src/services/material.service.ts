import { MaterialRepository } from '../repositories/material.repository';
import { CreateMaterialDto, UpdateMaterialDto, AdjustStockDto, MaterialResponse, mapToMaterialResponse } from '../types/material.types';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

export class MaterialService {
  private repository: MaterialRepository;

  constructor() {
    this.repository = new MaterialRepository();
  }

  // Buscar todos os materiais
  async getAllMaterials(filter: Record<string, any> = {}): Promise<MaterialResponse[]> {
    try {
      const materials = await this.repository.findAll(filter);
      return materials.map(material => mapToMaterialResponse(material as any));
    } catch (error) {
      logger.error('Erro ao buscar materiais:', error);
      throw error;
    }
  }

  // Buscar material por ID
  async getMaterialById(id: string): Promise<MaterialResponse> {
    try {
      const material = await this.repository.findById(id);
      return mapToMaterialResponse(material as any);
    } catch (error) {
      logger.error(`Erro ao buscar material com ID ${id}:`, error);
      throw error;
    }
  }

  // Criar novo material
  async createMaterial(materialData: CreateMaterialDto): Promise<MaterialResponse> {
    try {
      const material = await this.repository.create(materialData);
      logger.info(`Novo material criado: ${material.nome} (${material._id})`);
      return mapToMaterialResponse(material as any);
    } catch (error) {
      logger.error('Erro ao criar material:', error);
      throw error;
    }
  }

  // Atualizar material
  async updateMaterial(id: string, materialData: UpdateMaterialDto): Promise<MaterialResponse> {
    try {
      const material = await this.repository.update(id, materialData);
      logger.info(`Material atualizado: ${material.nome} (${material._id})`);
      return mapToMaterialResponse(material as any);
    } catch (error) {
      logger.error(`Erro ao atualizar material com ID ${id}:`, error);
      throw error;
    }
  }

  // Excluir material
  async deleteMaterial(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      logger.info(`Material excluído: ${id}`);
    } catch (error) {
      logger.error(`Erro ao excluir material com ID ${id}:`, error);
      throw error;
    }
  }

  // Ajustar estoque
  async adjustStock(id: string, adjustmentData: AdjustStockDto): Promise<MaterialResponse> {
    try {
      // Determinar se é entrada ou saída
      const ajuste = adjustmentData.tipo === 'entrada' 
        ? adjustmentData.quantidade 
        : -adjustmentData.quantidade;
      
      const material = await this.repository.adjustStock(id, ajuste);
      
      logger.info(`Estoque ajustado para ${material.nome} (${material._id}): ${adjustmentData.tipo} de ${adjustmentData.quantidade} unidades. Motivo: ${adjustmentData.motivo}`);
      
      return mapToMaterialResponse(material as any);
    } catch (error) {
      logger.error(`Erro ao ajustar estoque do material com ID ${id}:`, error);
      throw error;
    }
  }

  // Buscar materiais com estoque baixo
  async getLowStockMaterials(): Promise<MaterialResponse[]> {
    try {
      const materials = await this.repository.findLowStock();
      return materials.map(material => mapToMaterialResponse(material as any));
    } catch (error) {
      logger.error('Erro ao buscar materiais com estoque baixo:', error);
      throw error;
    }
  }

  // Buscar por categoria
  async getMaterialsByCategory(categoria: string): Promise<MaterialResponse[]> {
    try {
      const materials = await this.repository.findByCategory(categoria);
      return materials.map(material => mapToMaterialResponse(material as any));
    } catch (error) {
      logger.error(`Erro ao buscar materiais da categoria ${categoria}:`, error);
      throw error;
    }
  }

  // Buscar materiais por termo
  async searchMaterials(term: string): Promise<MaterialResponse[]> {
    try {
      const materials = await this.repository.search(term);
      return materials.map(material => mapToMaterialResponse(material as any));
    } catch (error) {
      logger.error(`Erro ao buscar materiais com termo "${term}":`, error);
      throw error;
    }
  }
}