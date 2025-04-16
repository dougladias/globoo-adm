export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: any; // Adiciona a propriedade opcional errors

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // Atribui os erros

    // Mantém o stack trace correto para erros personalizados (disponível no V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Define o protótipo explicitamente.
    Object.setPrototypeOf(this, AppError.prototype);
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