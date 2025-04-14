import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { env } from '../config/env';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { URL } from 'url';

// Configuração dos serviços disponíveis
const serviceConfig = {
  workers: {
    target: env.services.worker,
    pathRewrite: {
      '^/api/workers': '/api/workers'
    }
  },
  benefits: {
    target: env.services.benefits,
    pathRewrite: {
      '^/api/benefits': '/api/benefit-types',
      '^/api/employee-benefits': '/api/employee-benefits'
    }
  },
  payroll: {
    target: env.services.payroll,
    pathRewrite: {
      '^/api/payroll': '/api/payroll'
    }
  },
  document: {
    target: env.services.document,
    pathRewrite: {
      '^/api/documents': '/api/documents',
      '^/api/templates': '/api/templates'
    }
  }
};

// Função para criar um proxy para um serviço específico
export const createServiceProxy = (service: string) => {
  const config = serviceConfig[service as keyof typeof serviceConfig];
  
  if (!config) {
    throw new AppError(`Service '${service}' not configured`, 500);
  }
  
  // Verifica se o URL de destino é válido
  const options: Options = {
      target: config.target,
      changeOrigin: true,
      pathRewrite: config.pathRewrite,
      on: {
        proxyReq: (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => {
          // Se necessário, pode modificar a requisição aqui
          // Por exemplo, adicionar headers para autenticação interna
          logger.info(`Proxying request to ${service}: ${req.method} ${req.url}`);
        },
        proxyRes: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
          // Se necessário, pode modificar a resposta aqui
          logger.info(`Received response from ${service}: ${proxyRes.statusCode}`);
        },        
        // Se necessário, pode modificar a requisição WebSocket aqui
        error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket, target?: unknown) => {
          logger.error(`Proxy error for ${service}:`, err);
          if (res instanceof ServerResponse) {
            res.writeHead(500, {
              'Content-Type': 'application/json'
            });
            // Envia uma resposta de erro personalizada
            res.end(JSON.stringify({
              status: 'error',
              message: `Service ${service} is currently unavailable`,
              error: env.nodeEnv === 'development' ? err.message : undefined
            }));
          }
        }
      }
    };
  
    return createProxyMiddleware(options);
};

// Função para criar um proxy baseado na rota
export const routeBasedProxy = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  
  // Rotear com base no caminho da URL
  if (path.startsWith('/api/workers')) {
    return createServiceProxy('workers')(req, res, next);
  } 
  else if (path.startsWith('/api/benefits')) {
    return createServiceProxy('benefits')(req, res, next);
  }
  else if (path.startsWith('/api/employee-benefits')) {
    return createServiceProxy('benefits')(req, res, next);
  }
  else if (path.startsWith('/api/payroll')) {
    return createServiceProxy('payroll')(req, res, next);
  }
  else if (path.startsWith('/api/documents')) {
    return createServiceProxy('document')(req, res, next);
  }
  else if (path.startsWith('/api/templates')) {
    return createServiceProxy('document')(req, res, next);
  }
  
  // Se não houver correspondência, passar para o próximo middleware
  next();
};