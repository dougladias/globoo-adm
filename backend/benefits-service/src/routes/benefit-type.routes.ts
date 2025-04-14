import { Router } from 'express';
import * as benefitTypeController from '../controllers/benefit-type.controller';
import { validateBenefitTypeInput } from '../middleware/validation.middleware';

const router = Router();

router.get('/', benefitTypeController.getAllBenefitTypes);
router.get('/:id', benefitTypeController.getBenefitTypeById);
router.post('/', validateBenefitTypeInput, benefitTypeController.createBenefitType);
router.put('/:id', validateBenefitTypeInput, benefitTypeController.updateBenefitType);
router.patch('/:id/deactivate', benefitTypeController.deactivateBenefitType);
router.delete('/:id', benefitTypeController.deleteBenefitType);

export default router;