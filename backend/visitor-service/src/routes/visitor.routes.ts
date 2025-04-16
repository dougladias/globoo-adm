import { Router } from 'express';
import visitorController from '../controllers/visitor.controller';
import { authenticate as auth } from '../middleware/auth.middleware';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validações
const createValidations = [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('rg').notEmpty().withMessage('RG é obrigatório'),
    body('cpf')
        .notEmpty().withMessage('CPF é obrigatório')
        .custom((value: string) => /^\d{11}$/.test(value.replace(/[^\d]/g, ''))).withMessage('CPF inválido'),
    body('phone').notEmpty().withMessage('Telefone é obrigatório'),
    body('email')
        .notEmpty().withMessage('Email é obrigatório')
        .isEmail().withMessage('Email inválido'),
    body('address').notEmpty().withMessage('Endereço é obrigatório')
];

// Rotas públicas (sem autenticação)
// Nenhuma

// Rotas protegidas (com autenticação)
// GET /api/visitors - Listar todos os visitantes
router.get('/', auth, visitorController.getAllVisitors);

// GET /api/visitors/active - Listar visitantes ativos
router.get('/active', auth, visitorController.getActiveVisitors);

// GET /api/visitors/search - Buscar visitantes por termo
router.get(
  '/search', 
  auth,
  validate([query('term').notEmpty().withMessage('Termo de busca é obrigatório')]),
  visitorController.searchVisitors
);

// GET /api/visitors/date-range - Buscar visitantes por período
router.get(
  '/date-range',
  auth,
  validate([
    query('startDate').notEmpty().withMessage('Data inicial é obrigatória'),
    query('endDate').notEmpty().withMessage('Data final é obrigatória')
  ]),
  visitorController.getVisitorsByDateRange
);

// GET /api/visitors/:id - Buscar visitante por ID
router.get(
  '/:id',
  auth,
  validate([param('id').isMongoId().withMessage('ID inválido')]),
  visitorController.getVisitorById
);

// POST /api/visitors - Criar novo visitante
router.post(
    '/',
    auth,
    validate(createValidations),
    visitorController.createVisitor
  );
  
  // PUT /api/visitors/:id - Atualizar visitante
  router.put(
    '/:id',
    auth,
    validate([param('id').isMongoId().withMessage('ID inválido')]),
    visitorController.updateVisitor
  );
  
  // DELETE /api/visitors/:id - Excluir visitante
  router.delete(
    '/:id',
    auth,
    validate([param('id').isMongoId().withMessage('ID inválido')]),
    visitorController.deleteVisitor
  );
  
  // POST /api/visitors/:id/entry - Registrar entrada
  router.post(
    '/:id/entry',
    auth,
    validate([param('id').isMongoId().withMessage('ID inválido')]),
    visitorController.registerEntry
  );
  
  // POST /api/visitors/:id/exit - Registrar saída
  router.post(
    '/:id/exit',
    auth,
    validate([param('id').isMongoId().withMessage('ID inválido')]),
    visitorController.registerExit
  );
  
  export default router;