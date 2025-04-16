import { Router } from 'express';
import * as mealControlController from '../controllers/meal-control.controller';

const router = Router();

// Rotas básicas CRUD
router.get('/', mealControlController.getAllMealControls);
router.get('/:id', mealControlController.getMealControlById);
router.get('/employee/:employeeId', mealControlController.getMealControlByEmployeeId);
router.post('/', mealControlController.createMealControl);
router.put('/:id', mealControlController.updateMealControl);
router.delete('/:id', mealControlController.deleteMealControl);

// Rotas para registros de refeições
router.post('/:id/records', mealControlController.addMealRecord);
router.put('/:id/records/:recordId', mealControlController.updateMealRecord);
router.delete('/:id/records/:recordId', mealControlController.deleteMealRecord);

// Rotas para busca e relatórios
router.get('/department/:department', mealControlController.getMealControlsByDepartment);
router.get('/report', mealControlController.generateMealReport);

export default router;