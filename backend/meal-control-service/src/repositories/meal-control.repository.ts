import MealControl, { IMealControl, IMealRecord } from '../models/meal-control.model';
import { FilterQuery, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';

class MealControlRepository {
  async findAll(filter: FilterQuery<IMealControl> = {}): Promise<IMealControl[]> {
    try {
      return await MealControl.find(filter).sort({ employeeName: 1 });
    } catch (error) {
      logger.error('Error finding meal controls:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IMealControl | null> {
    try {
      return await MealControl.findById(id);
    } catch (error) {
      logger.error(`Error finding meal control by id ${id}:`, error);
      throw error;
    }
  }

  async findByEmployeeId(employeeId: string): Promise<IMealControl | null> {
    try {
      return await MealControl.findOne({ employeeId });
    } catch (error) {
      logger.error(`Error finding meal control for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async create(data: Partial<IMealControl>): Promise<IMealControl> {
    try {
      const mealControl = new MealControl(data);
      return await mealControl.save();
    } catch (error) {
      logger.error('Error creating meal control:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateQuery<IMealControl>): Promise<IMealControl | null> {
    try {
      return await MealControl.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating meal control ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<IMealControl | null> {
    try {
      return await MealControl.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting meal control ${id}:`, error);
      throw error;
    }
  }

  async addMealRecord(id: string, record: IMealRecord): Promise<IMealControl | null> {
    try {
      return await MealControl.findByIdAndUpdate(
        id,
        { $push: { mealRecords: record } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error adding meal record to control ${id}:`, error);
      throw error;
    }
  }

  async updateMealRecord(id: string, recordId: string, updateData: Partial<IMealRecord>): Promise<IMealControl | null> {
    try {
      // Encontrar o documento e o índice do registro
      const mealControl = await MealControl.findById(id);
      
      if (!mealControl) {
        return null;
      }
      
      // Encontrar o índice do registro
      const recordIndex: number = mealControl.mealRecords.findIndex(
        (record: IMealRecord): boolean => Boolean(record._id && record._id.toString() === recordId)
      );
      
      if (recordIndex === -1) {
        return null;
      }
      
      // Construir objeto de atualização
      const updateObj: Record<string, any> = {};
      
      // Atualizar campos específicos
      Object.entries(updateData).forEach(([key, value]) => {
        updateObj[`mealRecords.${recordIndex}.${key}`] = value;
      });
      
      // Executar a atualização
      return await MealControl.findByIdAndUpdate(
        id,
        { $set: updateObj },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating meal record ${recordId} in control ${id}:`, error);
      throw error;
    }
  }

  async deleteMealRecord(id: string, recordId: string): Promise<IMealControl | null> {
    try {
      return await MealControl.findByIdAndUpdate(
        id,
        { $pull: { mealRecords: { _id: recordId } } },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error deleting meal record ${recordId} from control ${id}:`, error);
      throw error;
    }
  }

  async findByDepartment(department: string): Promise<IMealControl[]> {
    try {
      return await MealControl.find({ department }).sort({ employeeName: 1 });
    } catch (error) {
      logger.error(`Error finding meal controls for department ${department}:`, error);
      throw error;
    }
  }

  async findMealRecordsInDateRange(startDate: Date, endDate: Date): Promise<IMealControl[]> {
    try {
      return await MealControl.find({
        'mealRecords.date': {
          $gte: startDate,
          $lte: endDate
        }
      });
    } catch (error) {
      logger.error(`Error finding meal records between ${startDate} and ${endDate}:`, error);
      throw error;
    }
  }
}

export default new MealControlRepository();