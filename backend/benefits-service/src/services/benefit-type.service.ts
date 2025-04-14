import benefitTypeRepository from '../repositories/benefit-type.repository';
import { IBenefitType } from '../models/benefit.model';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';

class BenefitTypeService {
  async getAllBenefitTypes(filter = {}): Promise<IBenefitType[]> {
    try {
      return await benefitTypeRepository.findAll(filter);
    } catch (error) {
      logger.error('Error getting all benefit types:', error);
      throw error;
    }
  }

  async getBenefitTypeById(id: string): Promise<IBenefitType> {
    try {
      const benefitType = await benefitTypeRepository.findById(id);
      if (!benefitType) {
        throw new AppError('Benefit type not found', 404);
      }
      return benefitType;
    } catch (error) {
      logger.error(`Error getting benefit type ${id}:`, error);
      throw error;
    }
  }

  async createBenefitType(data: Partial<IBenefitType>): Promise<IBenefitType> {
    try {
      return await benefitTypeRepository.create(data);
    } catch (error) {
      logger.error('Error creating benefit type:', error);
      throw error;
    }
  }

  async updateBenefitType(id: string, data: Partial<IBenefitType>): Promise<IBenefitType> {
    try {
      const benefitType = await benefitTypeRepository.update(id, data);
      if (!benefitType) {
        throw new AppError('Benefit type not found', 404);
      }
      return benefitType;
    } catch (error) {
      logger.error(`Error updating benefit type ${id}:`, error);
      throw error;
    }
  }

  async deactivateBenefitType(id: string): Promise<IBenefitType> {
    try {
      const benefitType = await benefitTypeRepository.update(id, { status: 'inactive' });
      if (!benefitType) {
        throw new AppError('Benefit type not found', 404);
      }
      return benefitType;
    } catch (error) {
      logger.error(`Error deactivating benefit type ${id}:`, error);
      throw error;
    }
  }

  async deleteBenefitType(id: string): Promise<void> {
    try {
      const result = await benefitTypeRepository.delete(id);
      if (!result) {
        throw new AppError('Benefit type not found', 404);
      }
    } catch (error) {
      logger.error(`Error deleting benefit type ${id}:`, error);
      throw error;
    }
  }
}

export default new BenefitTypeService();