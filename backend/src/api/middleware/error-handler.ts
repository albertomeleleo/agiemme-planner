import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Per Constitution: User-facing errors must be actionable and plain language
 */

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging (not exposed to client)
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // User-friendly error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      code,
      ...(process.env.NODE_ENV === 'development' && { details: err.details }),
    },
  });
}

/**
 * Create custom application error
 */
export function createError(message: string, statusCode: number, code?: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    },
  });
}
