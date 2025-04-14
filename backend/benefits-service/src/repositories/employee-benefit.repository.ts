import { EmployeeBenefit, IEmployeeBenefit } from '../models/benefit.model';
import { FilterQuery, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';

class EmployeeBenefitRepository {
  async findAll(filter: FilterQuery<IEmployeeBenefit> = {}): Promise<IEmployeeBenefit[]> {
    try {
      return await EmployeeBenefit.find(filter).populate('benefitTypeId');
    } catch (error) {
      logger.error('Error finding employee benefits:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IEmployeeBenefit | null> {
    try {
      return await EmployeeBenefit.findById(id).populate('benefitTypeId');
    } catch (error) {
      logger.error(`Error finding employee benefit by id ${id}:`, error);
      throw error;
    }
  }

  async findByEmployeeId(employeeId: string): Promise<IEmployeeBenefit[]> {
    try {
      return await EmployeeBenefit.find({ employeeId }).populate('benefitTypeId');
    } catch (error) {
      logger.error(`Error finding benefits for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async create(data: Partial<IEmployeeBenefit>): Promise<IEmployeeBenefit> {
    try {
      const employeeBenefit = new EmployeeBenefit(data);
      return await employeeBenefit.save();
    } catch (error) {
      logger.error('Error creating employee benefit:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateQuery<IEmployeeBenefit>): Promise<IEmployeeBenefit | null> {
    try {
      return await EmployeeBenefit.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      ).populate('benefitTypeId');
    } catch (error) {
      logger.error(`Error updating employee benefit ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<IEmployeeBenefit | null> {
    try {
      return await EmployeeBenefit.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting employee benefit ${id}:`, error);
      throw error;
    }
  }
}

export default new EmployeeBenefitRepository();