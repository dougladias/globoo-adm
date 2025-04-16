export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const handleError = (err: any) => {
    if (err.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(err.keyValue)[0];
      return new AppError(`Já existe um cadastro com este ${field}`, 409);
    }
  
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      const errors = Object.values(err.errors).map((val: any) => val.message);
      return new AppError(`Dados inválidos: ${errors.join(', ')}`, 400);
    }
  
    if (err.name === 'CastError') {
      // Mongoose cast error (e.g., invalid ID)
      return new AppError(`ID inválido: ${err.value}`, 400);
    }
  
    return err;
  };