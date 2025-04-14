import { Router } from 'express';
import * as templateController from '../controllers/template.controller';
import { templateUpload } from '../middleware/upload.middleware';

const router = Router();

// Rotas básicas CRUD
router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplateById);
router.post('/', templateUpload.single('file'), templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.patch('/:id/deactivate', templateController.deactivateTemplate);

// Rotas para busca e filtragem
router.get('/type/:type', templateController.getTemplatesByType);
router.get('/category/:category', templateController.getTemplatesByCategory);
router.get('/search', templateController.searchTemplates);

// Rotas para manipulação de templates
router.post('/:id/duplicate', templateController.duplicateTemplate);
router.get('/:id/download', templateController.downloadTemplate);
router.get('/:id/view', templateController.viewTemplate);

export default router;