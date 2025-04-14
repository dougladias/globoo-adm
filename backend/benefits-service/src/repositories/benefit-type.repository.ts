import { BenefitType, IBenefitType } from '../models/benefit.model';
import { FilterQuery, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';

class BenefitTypeRepository {
  async findAll(filter: FilterQuery<IBenefitType> = {}): Promise<IBenefitType[]> {
    try {
      return await BenefitType.find(filter);
    } catch (error) {
      logger.error('Error finding benefit types:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IBenefitType | null> {
    try {
      return await BenefitType.findById(id);
    } catch (error) {
      logger.error(`Error finding benefit type by id ${id}:`, error);
      throw error;
    }
  }

  async create(data: Partial<IBenefitType>): Promise<IBenefitType> {
    try {
      const benefitType = new BenefitType(data);
      return await benefitType.save();
    } catch (error) {
      logger.error('Error creating benefit type:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateQuery<IBenefitType>): Promise<IBenefitType | null> {
    try {
      return await BenefitType.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating benefit type ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<IBenefitType | null> {
    try {
      return await BenefitType.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting benefit type ${id}:`, error);
      throw error;
    }
  }
}

export default new BenefitTypeRepository();