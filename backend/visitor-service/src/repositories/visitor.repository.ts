import Visitor, { IVisitor } from '../models/visitor.model';
import { FilterQuery, UpdateQuery, SortOrder } from 'mongoose';
import logger from '../utils/logger';

class VisitorRepository {
  async findAll(filter: FilterQuery<IVisitor> = {}, sort: { [key: string]: SortOrder } = { createdAt: -1 }): Promise<IVisitor[]> {
    try {
      return await Visitor.find(filter).sort(sort);
    } catch (error) {
      logger.error('Error finding visitors:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IVisitor | null> {
    try {
      return await Visitor.findById(id);
    } catch (error) {
      logger.error(`Error finding visitor by id ${id}:`, error);
      throw error;
    }
  }

  async findByCpf(cpf: string): Promise<IVisitor | null> {
    try {
      return await Visitor.findOne({ cpf });
    } catch (error) {
      logger.error(`Error finding visitor by CPF ${cpf}:`, error);
      throw error;
    }
  }

  async create(visitorData: Partial<IVisitor>): Promise<IVisitor> {
    try {
      const visitor = new Visitor(visitorData);
      return await visitor.save();
    } catch (error) {
      logger.error('Error creating visitor:', error);
      throw error;
    }
  }

  async update(id: string, visitorData: UpdateQuery<IVisitor>): Promise<IVisitor | null> {
    try {
      return await Visitor.findByIdAndUpdate(
        id,
        visitorData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating visitor ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<IVisitor | null> {
    try {
      return await Visitor.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting visitor ${id}:`, error);
      throw error;
    }
  }

  async search(query: string): Promise<IVisitor[]> {
    try {
      return await Visitor.find({ $text: { $search: query } })
        .sort({ score: { $meta: 'textScore' } });
    } catch (error) {
      logger.error(`Error searching visitors with query "${query}":`, error);
      throw error;
    }
  }

  async registerEntry(id: string): Promise<IVisitor | null> {
    try {
      return await Visitor.findByIdAndUpdate(
        id,
        { $push: { logs: { entryTime: new Date() } } },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error registering entry for visitor ${id}:`, error);
      throw error;
    }
  }

  async registerExit(id: string): Promise<IVisitor | null> {
    try {
      const visitor = await Visitor.findById(id);
      
      if (!visitor || visitor.logs.length === 0) {
        return null;
      }
      
      // Atualizar o último log
      const lastLogIndex = visitor.logs.length - 1;
      if (visitor.logs[lastLogIndex].leaveTime) {
        // O último log já tem saída registrada, criar novo log
        visitor.logs.push({
          entryTime: new Date(),
          leaveTime: new Date()
        });
      } else {
        // Atualizar a saída do último log
        visitor.logs[lastLogIndex].leaveTime = new Date();
      }
      
      await visitor.save();
      return visitor;
    } catch (error) {
      logger.error(`Error registering exit for visitor ${id}:`, error);
      throw error;
    }
  }

  async getActiveVisitors(): Promise<IVisitor[]> {
    try {
      return await Visitor.find({
        'logs': {
          $elemMatch: {
            'leaveTime': { $exists: false }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding active visitors:', error);
      throw error;
    }
  }

  async getVisitorsForPeriod(startDate: Date, endDate: Date): Promise<IVisitor[]> {
    try {
      return await Visitor.find({
        'logs.entryTime': {
          $gte: startDate,
          $lte: endDate
        }
      });
    } catch (error) {
      logger.error(`Error finding visitors for period ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }
}

export default new VisitorRepository();