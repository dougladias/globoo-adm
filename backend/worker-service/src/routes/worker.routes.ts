import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import * as workerController from '../controllers/worker.controller';
import { validateWorkerInput } from '../middleware/validation.middleware';

const router = Router();

// Rotas para Gerenciamento de Funcionários
router.get('/', asyncHandler(workerController.getAllWorkers));
router.get('/:id', asyncHandler(workerController.getWorkerById));
router.post('/', validateWorkerInput, asyncHandler(workerController.createWorker));
router.put('/:id', validateWorkerInput, asyncHandler(workerController.updateWorker));
router.delete('/:id', asyncHandler(workerController.deleteWorker));

// Rotas para Registro de Ponto
router.post('/:id/entry', asyncHandler(workerController.registerEntry));
router.post('/:id/exit', asyncHandler(workerController.registerExit));
router.post('/:id/absence', asyncHandler(workerController.registerAbsence));

// Função utilitária para envolver manipuladores de rota assíncronos e capturar erros
function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
}

export default router;

