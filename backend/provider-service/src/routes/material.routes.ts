import { Router, RequestHandler } from 'express';
import materialController from '../controllers/material.controller';
import { auth, authorize } from '../middleware/auth.middleware';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validações
const createValidations = [
    body('categoria').notEmpty().withMessage('Categoria é obrigatória'),
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('quantidade')
        .notEmpty().withMessage('Quantidade é obrigatória')
        .isNumeric().withMessage('Quantidade deve ser um número')
        .custom(value => value >= 0).withMessage('Quantidade não pode ser negativa'),
    body('unidade').notEmpty().withMessage('Unidade é obrigatória'),
    body('preco')
        .notEmpty().withMessage('Preço é obrigatório')
        .isNumeric().withMessage('Preço deve ser um número')
        .custom(value => value >= 0).withMessage('Preço não pode ser negativo')
];

const adjustStockValidations = [
    body('quantidade')
        .notEmpty().withMessage('Quantidade é obrigatória')
        .isNumeric().withMessage('Quantidade deve ser um número')
        .custom(value => value > 0).withMessage('Quantidade deve ser positiva'),
    body('motivo').notEmpty().withMessage('Motivo é obrigatório'),
    body('tipo')
        .notEmpty().withMessage('Tipo é obrigatório')
        .isIn(['entrada', 'saida']).withMessage('Tipo deve ser "entrada" ou "saida"')
];

// GET /api/materials - Listar todos os materiais
router.get('/', auth, materialController.getAllMaterials);

// GET /api/materials/low-stock - Listar materiais com estoque baixo
router.get('/low-stock', auth, materialController.getLowStockMaterials);

// GET /api/materials/search - Buscar materiais por termo
router.get(
    '/search',
    auth,
    validate([query('term').notEmpty().withMessage('Termo de busca é obrigatório')]) as RequestHandler,
    materialController.searchMaterials
);

// GET /api/materials/category/:categoria - Buscar materiais por categoria
router.get(
    '/category/:categoria',
    auth,
    validate([param('categoria').notEmpty().withMessage('Categoria é obrigatória')]) as RequestHandler,
    materialController.getMaterialsByCategory
);

// GET /api/materials/:id - Buscar material por ID
router.get(
    '/:id',
    auth,
    validate([param('id').isMongoId().withMessage('ID inválido')]) as RequestHandler,
    materialController.getMaterialById
);

// POST /api/materials - Criar novo material
router.post(
    '/',
    auth,
    validate(createValidations) as RequestHandler,
    materialController.createMaterial
);

// PUT /api/materials/:id - Atualizar material
router.put(
    '/:id',
    auth,
    validate([param('id').isMongoId().withMessage('ID inválido')]) as RequestHandler,
    materialController.updateMaterial
);

// POST /api/materials/:id/stock - Ajustar estoque
router.post(
    '/:id/stock',
    auth,
    validate([
        param('id').isMongoId().withMessage('ID inválido'),
        ...adjustStockValidations
    ]) as RequestHandler,
    materialController.adjustStock
);

// DELETE /api/materials/:id - Excluir material
router.delete(
    '/:id',
    auth,
    validate([param('id').isMongoId().withMessage('ID inválido')]) as RequestHandler,
    materialController.deleteMaterial
);

export default router;