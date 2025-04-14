import { Router } from 'express';
import * as employeeBenefitController from '../controllers/employee-benefit.controller';
import { validateEmployeeBenefitInput } from '../middleware/validation.middleware';

const router = Router();

router.get('/', employeeBenefitController.getAllEmployeeBenefits);
router.get('/:id', employeeBenefitController.getEmployeeBenefitById);
router.get('/employee/:employeeId', employeeBenefitController.getEmployeeBenefitsByEmployeeId);
router.post('/', validateEmployeeBenefitInput, employeeBenefitController.createEmployeeBenefit);
router.put('/:id', validateEmployeeBenefitInput, employeeBenefitController.updateEmployeeBenefit);
router.patch('/:id/deactivate', employeeBenefitController.deactivateEmployeeBenefit);
router.delete('/:id', employeeBenefitController.deleteEmployeeBenefit);

export default router;