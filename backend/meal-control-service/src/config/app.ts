import { env } from './env';

export const config = {
  port: env.port,
  nodeEnv: env.nodeEnv,
  cors: {
    origin: '*',
    credentials: true
  }
};