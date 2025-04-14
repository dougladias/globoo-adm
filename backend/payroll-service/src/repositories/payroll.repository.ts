import Payroll, { IPayroll } from '../models/payroll.model';
import { FilterQuery, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';
import { PayrollCalculation } from '../services/payroll-calculator.service';

class PayrollRepository {
  async findAll(filter: FilterQuery<IPayroll> = {}): Promise<IPayroll[]> {
    try {
      return await Payroll.find(filter).sort({ year: -1, month: -1 });
    } catch (error) {
      logger.error('Error finding payrolls:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IPayroll | null> {
    try {
      return await Payroll.findById(id);
    } catch (error) {
      logger.error(`Error finding payroll by id ${id}:`, error);
      throw error;
    }
  }

  async findByEmployeeMonthYear(employeeId: string, month: number, year: number): Promise<IPayroll | null> {
    try {
      return await Payroll.findOne({ employeeId, month, year });
    } catch (error) {
      logger.error(`Error finding payroll for employee ${employeeId} (${month}/${year}):`, error);
      throw error;
    }
  }

  async create(data: PayrollCalculation, month: number, year: number): Promise<IPayroll> {
    try {
      const payrollData = {
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        contract: data.contract,
        month,
        year,
        baseSalary: data.baseSalary,
        overtimePay: data.overtimePay,
        overtimeHours: data.overtimeHours,
        deductions: data.deductions,
        totalSalary: data.totalSalary,
        inss: data.inss,
        fgts: data.fgts,
        irrf: data.irrf,
        status: 'processed'
      };
      
      const payroll = new Payroll(payrollData);
      return await payroll.save();
    } catch (error) {
      logger.error('Error creating payroll:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateQuery<IPayroll>): Promise<IPayroll | null> {
    try {
      return await Payroll.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating payroll ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<IPayroll | null> {
    try {
      return await Payroll.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting payroll ${id}:`, error);
      throw error;
    }
  }

  async findByMonthYear(month: number, year: number): Promise<IPayroll[]> {
    try {
      return await Payroll.find({ month, year }).sort({ employeeName: 1 });
    } catch (error) {
      logger.error(`Error finding payrolls for ${month}/${year}:`, error);
      throw error;
    }
  }

  async deleteByMonthYear(month: number, year: number): Promise<{ deletedCount: number }> {
    try {
      const result = await Payroll.deleteMany({ month, year });
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      logger.error(`Error deleting payrolls for ${month}/${year}:`, error);
      throw error;
    }
  }

  async markAsPaid(id: string): Promise<IPayroll | null> {
    try {
      return await Payroll.findByIdAndUpdate(
        id,
        {
          status: 'paid',
          paidAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error marking payroll ${id} as paid:`, error);
      throw error;
    }
  }
}

export default new PayrollRepository();