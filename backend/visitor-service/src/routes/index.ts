import { Router } from 'express';
import visitorRoutes from './visitor.routes';

const router = Router();

// Rota de verificação da API
router.get('/', (req, res) => {
  res.status(200).json({
    service: 'visitor-service',
    version: '1.0.0',
    status: 'running'
  });
});

// Incorporar as rotas de visitantes
router.use('/visitors', visitorRoutes);

export default router;