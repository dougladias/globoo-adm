import { Request, Response, NextFunction } from 'express';
import benefitTypeService from '../services/benefit-type.service';
import logger from '../utils/logger';

export const getAllBenefitTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const benefitTypes = await benefitTypeService.getAllBenefitTypes();
    res.status(200).json(benefitTypes);
  } catch (error) {
    logger.error('Error in getAllBenefitTypes controller:', error);
    next(error);
  }
};

export const getBenefitTypeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const benefitType = await benefitTypeService.getBenefitTypeById(id);
    res.status(200).json(benefitType);
  } catch (error) {
    logger.error(`Error in getBenefitTypeById controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const createBenefitType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const benefitType = await benefitTypeService.createBenefitType(req.body);
    res.status(201).json(benefitType);
  } catch (error) {
    logger.error('Error in createBenefitType controller:', error);
    next(error);
  }
};

export const updateBenefitType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const benefitType = await benefitTypeService.updateBenefitType(id, req.body);
    res.status(200).json(benefitType);
  } catch (error) {
    logger.error(`Error in updateBenefitType controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deactivateBenefitType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const benefitType = await benefitTypeService.deactivateBenefitType(id);
    res.status(200).json({
      message: 'Benefit type deactivated successfully',
      benefitType
    });
  } catch (error) {
    logger.error(`Error in deactivateBenefitType controller for id ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteBenefitType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await benefitTypeService.deleteBenefitType(id);
    res.status(200).json({ message: 'Benefit type deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteBenefitType controller for id ${req.params.id}:`, error);
    next(error);
  }
};