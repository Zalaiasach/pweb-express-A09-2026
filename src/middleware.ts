import type { Request, Response, NextFunction } from 'express';

// Custom HttpError untuk melempar statusCode spesifik (400, 404, 409, dll)
export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// 1. Logger Middleware: mencatat method, URL, dan statusCode di terminal
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
};

// 2. Not Found Middleware: URL yang tidak terdaftar otomatis dibalas 404
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: false,
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
};

// 3. Centralized Error Handler Middleware
export const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada internal server';

  res.status(statusCode).json({
    status: false,
    message,
  });
};