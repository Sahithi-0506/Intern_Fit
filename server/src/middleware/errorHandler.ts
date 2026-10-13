import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      message: `Validation error: ${errorDetails}`,
      errors: err.errors,
    });
    return;
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File too large. Maximum allowed PDF size is 5MB.',
      });
      return;
    }
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    return;
  }

  // Safe fallback error handling without leaking secrets or stack traces
  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
  const message = statusCode === 500 ? 'An unexpected server error occurred. Please try again.' : err.message;

  console.error(`[Server Error] [Status ${statusCode}]:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    message,
  });
}
