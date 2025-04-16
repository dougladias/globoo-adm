import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/app';
import { connectDB } from './config/db';
import logger from './utils/logger';
import visitorRoutes from './routes/visitor.routes';

// Inicializar express
const app = express();

// Middlewares
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/api/visitors', visitorRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'visitor-service',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Middleware de tratamento de erros
// Interface for custom error type
interface CustomError extends Error {
    statusCode?: number;
}

// Error handling middleware
app.use((err: CustomError, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    
    res.status(statusCode).json({ message });
});

// Iniciar o servidor
const PORT = config.port;

const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado na porta ${PORT} - Ambiente: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratar encerramento gracioso
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Exportar para testes
export { app };

// Iniciar servidor se não for importado para testes
if (process.env.NODE_ENV !== 'test') {
  startServer();
}