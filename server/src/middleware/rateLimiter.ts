import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const hits = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter to protect endpoints from abuse, credential stuffing, and brute force.
 */
export function rateLimiter(options: { windowMs: number; maxHits: number; message?: string }) {
  const { windowMs, maxHits, message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = hits.get(key);
    if (!record || now > record.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    record.count++;
    if (record.count > maxHits) {
      const waitSec = Math.ceil((record.resetAt - now) / 1000);
      res.status(429).json({
        success: false,
        message: message || `Too many requests. Please try again after ${waitSec} seconds.`,
      });
      return;
    }

    next();
  };
}
