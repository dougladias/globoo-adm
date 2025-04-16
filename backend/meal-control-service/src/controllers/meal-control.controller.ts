import { Request, Response, NextFunction } from 'express';
import mealControlService from '../services/meal-control.service';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';

export const getAllMealControls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Processar filtros opcionais
    const filter: Record<string, any> = {};
    
    if (req.query.department) {
      filter.department = req.query.department;
    }
    
    const mealControls = await mealControlService.getAllMealControls(filter);
    res.status(200).json(mealControls);
  } catch (error) {
    logger.error('Error in getAllMealControls controller:', error);
    next(error);
  }
};

export const getMealControlById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mealControl = await mealControlService.getMealControlById(id);
    res.status(200).json(mealControl);
  } catch (error) {
    logger.error(`Error in getMealControlById controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const getMealControlByEmployeeId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const mealControl = await mealControlService.getMealControlByEmployeeId(employeeId);
    res.status(200).json(mealControl);
  } catch (error) {
    logger.error(`Error in getMealControlByEmployeeId controller for employee ${req.params.employeeId}:`, error);
    next(error);
  }
};

export const createMealControl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mealControlData = req.body;
    const mealControl = await mealControlService.createMealControl(mealControlData);
    res.status(201).json(mealControl);
  } catch (error) {
    logger.error('Error in createMealControl controller:', error);
    next(error);
  }
};

export const updateMealControl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mealControlData = req.body;
    const mealControl = await mealControlService.updateMealControl(id, mealControlData);
    res.status(200).json(mealControl);
  } catch (error) {
    logger.error(`Error in updateMealControl controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteMealControl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await mealControlService.deleteMealControl(id);
    res.status(200).json({ message: 'Controle de refeição excluído com sucesso' });
  } catch (error) {
    logger.error(`Error in deleteMealControl controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const addMealRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const recordData = req.body;
    const mealControl = await mealControlService.addMealRecord(id, recordData);
    res.status(201).json({
      message: 'Registro de refeição adicionado com sucesso',
      mealControl
    });
  } catch (error) {
    logger.error(`Error in addMealRecord controller for control ${req.params.id}:`, error);
    next(error);
  }
};

export const updateMealRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, recordId } = req.params;
    const updateData = req.body;
    const mealControl = await mealControlService.updateMealRecord(id, recordId, updateData);
    res.status(200).json({
      message: 'Registro de refeição atualizado com sucesso',
      mealControl
    });
  } catch (error) {
    logger.error(`Error in updateMealRecord controller for record ${req.params.recordId} in control ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteMealRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, recordId } = req.params;
    const mealControl = await mealControlService.deleteMealRecord(id, recordId);
    res.status(200).json({
      message: 'Registro de refeição excluído com sucesso',
      mealControl
    });
  } catch (error) {
    logger.error(`Error in deleteMealRecord controller for record ${req.params.recordId} in control ${req.params.id}:`, error);
    next(error);
  }
};

export const getMealControlsByDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department } = req.params;
    const mealControls = await mealControlService.getMealControlsByDepartment(department);
    res.status(200).json(mealControls);
  } catch (error) {
    logger.error(`Error in getMealControlsByDepartment controller for department ${req.params.department}:`, error);
    next(error);
  }
};

export const generateMealReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError('Período (startDate e endDate) é obrigatório', 400);
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Datas inválidas', 400);
    }
    
    const reportData = await mealControlService.generateMealReport(
      start, 
      end, 
      department as string
    );
    
    res.status(200).json(reportData);
  } catch (error) {
    logger.error('Error in generateMealReport controller:', error);
    next(error);
  }
};