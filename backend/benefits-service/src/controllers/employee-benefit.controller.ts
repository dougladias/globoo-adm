import { Request, Response, NextFunction } from 'express';
import employeeBenefitService from '../services/employee-benefit.service';
import logger from '../utils/logger';

export const getAllEmployeeBenefits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeBenefits = await employeeBenefitService.getAllEmployeeBenefits();
    res.status(200).json(employeeBenefits);
  } catch (error) {
    logger.error('Error in getAllEmployeeBenefits controller:', error);
    next(error);
  }
};

export const getEmployeeBenefitById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employeeBenefit = await employeeBenefitService.getEmployeeBenefitById(id);
    res.status(200).json(employeeBenefit);
  } catch (error) {
    logger.error(`Error in getEmployeeBenefitById controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const getEmployeeBenefitsByEmployeeId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const employeeBenefits = await employeeBenefitService.getEmployeeBenefitsByEmployeeId(employeeId);
    res.status(200).json(employeeBenefits);
  } catch (error) {
    logger.error(`Error in getEmployeeBenefitsByEmployeeId controller for employee ${req.params.employeeId}:`, error);
    next(error);
  }
};

export const createEmployeeBenefit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeBenefit = await employeeBenefitService.createEmployeeBenefit(req.body);
    res.status(201).json(employeeBenefit);
  } catch (error) {
    logger.error('Error in createEmployeeBenefit controller:', error);
    next(error);
  }
};

export const updateEmployeeBenefit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employeeBenefit = await employeeBenefitService.updateEmployeeBenefit(id, req.body);
    res.status(200).json(employeeBenefit);
  } catch (error) {
    logger.error(`Error in updateEmployeeBenefit controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deactivateEmployeeBenefit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employeeBenefit = await employeeBenefitService.deactivateEmployeeBenefit(id);
    res.status(200).json({
      message: 'Employee benefit deactivated successfully',
      employeeBenefit
    });
  } catch (error) {
    logger.error(`Error in deactivateEmployeeBenefit controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteEmployeeBenefit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await employeeBenefitService.deleteEmployeeBenefit(id);
    res.status(200).json({ message: 'Employee benefit deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteEmployeeBenefit controller for id ${req.params.id}:`, error);
    next(error);
  }
};