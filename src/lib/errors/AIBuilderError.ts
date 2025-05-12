// src/lib/errors/AIBuilderError.ts

export class AIBuilderError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AIBuilderError';
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}