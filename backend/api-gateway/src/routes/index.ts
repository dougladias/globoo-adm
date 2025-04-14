import { Router } from 'express';
import { routeBasedProxy } from '../services/proxy.service';
import { apiLimiter } from '../middleware/rate-limit.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Rota de health check (não autenticada)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Aplicar rate limiting e autenticação para rotas da API
router.use('/api', apiLimiter, authenticate, routeBasedProxy);

export default router;