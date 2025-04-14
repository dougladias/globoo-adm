import DocumentTemplate, { IDocumentTemplate } from '../models/template.model';
import { FilterQuery, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';

class TemplateRepository {
  async findAll(filter: FilterQuery<IDocumentTemplate> = { isActive: true }): Promise<IDocumentTemplate[]> {
    try {
      return await DocumentTemplate.find(filter).sort({ updatedAt: -1 });
    } catch (error) {
      logger.error('Error finding templates:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IDocumentTemplate | null> {
    try {
      return await DocumentTemplate.findById(id);
    } catch (error) {
      logger.error(`Error finding template by id ${id}:`, error);
      throw error;
    }
  }

  async create(templateData: Partial<IDocumentTemplate>): Promise<IDocumentTemplate> {
    try {
      const template = new DocumentTemplate(templateData);
      return await template.save();
    } catch (error) {
      logger.error('Error creating template:', error);
      throw error;
    }
  }

  async update(id: string, templateData: UpdateQuery<IDocumentTemplate>): Promise<IDocumentTemplate | null> {
    try {
      return await DocumentTemplate.findByIdAndUpdate(
        id,
        templateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating template ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<IDocumentTemplate | null> {
    try {
      return await DocumentTemplate.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  }

  async deactivate(id: string): Promise<IDocumentTemplate | null> {
    try {
      return await DocumentTemplate.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error deactivating template ${id}:`, error);
      throw error;
    }
  }

  async search(query: string): Promise<IDocumentTemplate[]> {
    try {
      return await DocumentTemplate.find({ 
        $text: { $search: query },
        isActive: true
      }).sort({ score: { $meta: 'textScore' } });
    } catch (error) {
      logger.error(`Error searching templates with query "${query}":`, error);
      throw error;
    }
  }

  async findByType(type: string): Promise<IDocumentTemplate[]> {
    try {
      return await DocumentTemplate.find({ 
        type, 
        isActive: true 
      }).sort({ updatedAt: -1 });
    } catch (error) {
      logger.error(`Error finding templates by type ${type}:`, error);
      throw error;
    }
  }

  async findByCategory(category: string): Promise<IDocumentTemplate[]> {
    try {
      return await DocumentTemplate.find({ 
        category, 
        isActive: true 
      }).sort({ updatedAt: -1 });
    } catch (error) {
      logger.error(`Error finding templates by category ${category}:`, error);
      throw error;
    }
  }

  async duplicate(id: string, newData: Partial<IDocumentTemplate>): Promise<IDocumentTemplate | null> {
    try {
      const template = await DocumentTemplate.findById(id);
      if (!template) {
        return null;
      }
      
      const newTemplate = new DocumentTemplate({
        name: newData.name || `${template.name} (Cópia)`,
        type: newData.type || template.type,
        description: newData.description || template.description,
        createdBy: newData.createdBy || template.createdBy,
        format: newData.format || template.format,
        filePath: newData.filePath || template.filePath,
        isActive: true,
        category: newData.category || template.category,
        version: template.version + 1
      });
      
      return await newTemplate.save();
    } catch (error) {
      logger.error(`Error duplicating template ${id}:`, error);
      throw error;
    }
  }
}

export default new TemplateRepository();