import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/app';
import { connectDB } from './config/db';
import benefitTypeRoutes from './routes/benefit-type.routes';
import employeeBenefitRoutes from './routes/employee-benefit.routes';
import { errorHandler, notFound } from './utils/error-handler';
import logger from './utils/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Rotas
app.use('/api/benefit-types', benefitTypeRoutes);
app.use('/api/employee-benefits', employeeBenefitRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'benefits-service' });
});

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware para tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Iniciar servidor Express
    const server = app.listen(config.port, () => {
      logger.info(`Benefits service running in ${config.nodeEnv} mode on port ${config.port}`);
    });

    // Tratamento de erros não tratados
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION:', err);
      // Fechar o servidor graciosamente
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar o servidor
startServer();

export default app;