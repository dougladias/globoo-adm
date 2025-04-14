import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './utils/error-handler';
import logger from './utils/logger';

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors({
  origin: '*', // Em produção, deve ser mais restritivo
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Rotas
app.use('/', routes);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware para tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const port = env.port;
app.listen(port, () => {
  logger.info(`API Gateway running in ${env.nodeEnv} mode on port ${port}`);
});

export default app;