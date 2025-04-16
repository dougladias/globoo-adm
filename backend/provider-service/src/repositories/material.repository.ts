import Material, { IMaterial } from '../models/material.model';
import { CreateMaterialDto, UpdateMaterialDto } from '../types/material.types';
import { AppError } from '../utils/error-handler';
import mongoose from 'mongoose';

export class MaterialRepository {
  // Buscar todos os materiais
  async findAll(filter: Record<string, any> = {}): Promise<IMaterial[]> {
    return Material.find(filter).sort({ nome: 1 });
  }

  // Buscar material por ID
  async findById(id: string): Promise<IMaterial> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de material inválido', 400);
    }
    
    const material = await Material.findById(id);
    
    if (!material) {
      throw new AppError('Material não encontrado', 404);
    }
    
    return material;
  }

  // Criar novo material
  async create(materialData: CreateMaterialDto): Promise<IMaterial> {
    const material = new Material(materialData);
    await material.save();
    return material;
  }

  // Atualizar material
  async update(id: string, materialData: UpdateMaterialDto): Promise<IMaterial> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de material inválido', 400);
    }
    
    const material = await Material.findByIdAndUpdate(
      id,
      { ...materialData, dataAtualizacao: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!material) {
      throw new AppError('Material não encontrado', 404);
    }
    
    return material;
  }

  // Excluir material
  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de material inválido', 400);
    }
    
    const result = await Material.findByIdAndDelete(id);
    
    if (!result) {
      throw new AppError('Material não encontrado', 404);
    }
  }

  // Ajustar estoque (entrada/saída)
  async adjustStock(id: string, quantidade: number): Promise<IMaterial> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID de material inválido', 400);
    }
    
    const material = await Material.findById(id);
    
    if (!material) {
      throw new AppError('Material não encontrado', 404);
    }
    
    // Atualizar quantidade e verificar se não fica negativa
    const novaQuantidade = material.quantidade + quantidade;
    
    if (novaQuantidade < 0) {
      throw new AppError('Quantidade não pode ficar negativa', 400);
    }
    
    material.quantidade = novaQuantidade;
    material.dataAtualizacao = new Date();
    
    await material.save();
    return material;
  }

  // Buscar materiais com estoque baixo
  async findLowStock(): Promise<IMaterial[]> {
    return Material.find({
      $expr: {
        $and: [
          { $ne: [{ $ifNull: ['$estoqueMinimo', null] }, null] },
          { $lt: ['$quantidade', '$estoqueMinimo'] }
        ]
      }
    }).sort({ categoria: 1, nome: 1 });
  }

  // Buscar por categoria
  async findByCategory(categoria: string): Promise<IMaterial[]> {
    return Material.find({ categoria }).sort({ nome: 1 });
  }

  // Buscar por termo (nome, descrição)
  async search(term: string): Promise<IMaterial[]> {
    const normalizedTerm = term.trim();
    
    return Material.find({
      $or: [
        { nome: { $regex: normalizedTerm, $options: 'i' } },
        { descricao: { $regex: normalizedTerm, $options: 'i' } },
        { fornecedor: { $regex: normalizedTerm, $options: 'i' } }
      ]
    }).sort({ categoria: 1, nome: 1 });
  }
}