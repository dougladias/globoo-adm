import Document, { IDocument } from '../models/document.model';
import { FilterQuery, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';

class DocumentRepository {
  async findAll(filter: FilterQuery<IDocument> = {}, options = { sort: { uploadDate: -1 } }): Promise<IDocument[]> {
    try {
      return await Document.find(filter).sort(options.sort as { [key: string]: 1 | -1 });
    } catch (error) {
      logger.error('Error finding documents:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IDocument | null> {
    try {
      return await Document.findById(id);
    } catch (error) {
      logger.error(`Error finding document by id ${id}:`, error);
      throw error;
    }
  }

  async create(documentData: Partial<IDocument>): Promise<IDocument> {
    try {
      const document = new Document(documentData);
      return await document.save();
    } catch (error) {
      logger.error('Error creating document:', error);
      throw error;
    }
  }

  async update(id: string, documentData: UpdateQuery<IDocument>): Promise<IDocument | null> {
    try {
      return await Document.findByIdAndUpdate(
        id,
        documentData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating document ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<IDocument | null> {
    try {
      return await Document.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }

  async findByEmployeeId(employeeId: string): Promise<IDocument[]> {
    try {
      return await Document.find({ employeeId }).sort({ uploadDate: -1 });
    } catch (error) {
      logger.error(`Error finding documents for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async search(query: string): Promise<IDocument[]> {
    try {
      return await Document.find({ $text: { $search: query } })
        .sort({ score: { $meta: 'textScore' } });
    } catch (error) {
      logger.error(`Error searching documents with query "${query}":`, error);
      throw error;
    }
  }

  async findByType(type: string): Promise<IDocument[]> {
    try {
      return await Document.find({ type }).sort({ uploadDate: -1 });
    } catch (error) {
      logger.error(`Error finding documents by type ${type}:`, error);
      throw error;
    }
  }

  async findByTags(tags: string[]): Promise<IDocument[]> {
    try {
      return await Document.find({ tags: { $in: tags } }).sort({ uploadDate: -1 });
    } catch (error) {
      logger.error(`Error finding documents by tags ${tags.join(', ')}:`, error);
      throw error;
    }
  }

  async findExpiring(days: number): Promise<IDocument[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      return await Document.find({
        expiryDate: { $lte: futureDate, $gte: new Date() }
      }).sort({ expiryDate: 1 });
    } catch (error) {
      logger.error(`Error finding documents expiring in ${days} days:`, error);
      throw error;
    }
  }
}

export default new DocumentRepository();