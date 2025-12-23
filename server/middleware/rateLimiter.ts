import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, isRedisConnected } from '../redis';
import type { Request } from 'express';

// Store initialized limiters
let limiters: {
  global?: RateLimitRequestHandler;
  auth?: RateLimitRequestHandler;
  ai?: RateLimitRequestHandler;
  publicMenu?: RateLimitRequestHandler;
  upload?: RateLimitRequestHandler;
} = {};

/**
 * Create a rate limiter with Redis store (falls back to memory if Redis unavailable)
 */
async function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string | object;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  prefix?: string;
}): Promise<RateLimitRequestHandler> {
  const redisClient = await getRedisClient();

  const baseConfig = {
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: options.keyGenerator || ((req: Request) => {
      return req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    }),
    validate: false,
  };

  // Use Redis store if available, otherwise fall back to memory store
  if (redisClient && isRedisConnected()) {
    console.log(`[RateLimiter] Using Redis store for ${options.prefix || 'default'}`);
    return rateLimit({
      ...baseConfig,
      store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: `qrmenu:rl:${options.prefix || ''}:`,
      }),
    });
  }

  console.warn(`[RateLimiter] Redis not available, using memory store for ${options.prefix || 'default'}`);
  return rateLimit(baseConfig);
}

/**
 * Initialize all rate limiters
 * Should be called after Redis is initialized
 */
export async function initRateLimiters(): Promise<void> {
  console.log('[RateLimiter] Initializing rate limiters...');

  limiters.global = await createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later' },
    prefix: 'global',
  });

  limiters.auth = await createRateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    message: { error: 'Too many login attempts, please try again later' },
    skipSuccessfulRequests: true,
    prefix: 'auth',
  });

  limiters.ai = await createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Production limit: 10 AI requests per hour per IP
    message: { error: 'AI rate limit exceeded. Please wait before making more AI requests' },
    prefix: 'ai',
  });

  limiters.publicMenu = await createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    message: { error: 'Too many requests, please try again shortly' },
    prefix: 'public',
  });

  limiters.upload = await createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: { error: 'Upload limit reached. Please try again later' },
    prefix: 'upload',
  });

  console.log('[RateLimiter] All rate limiters initialized');
}

/**
 * Get global API rate limiter: 100 requests per 15 minutes
 */
export function getGlobalLimiter(): RateLimitRequestHandler {
  if (!limiters.global) {
    throw new Error('Rate limiters not initialized. Call initRateLimiters() first.');
  }
  return limiters.global;
}

/**
 * Get authentication rate limiter: 5 attempts per 10 minutes
 */
export function getAuthLimiter(): RateLimitRequestHandler {
  if (!limiters.auth) {
    throw new Error('Rate limiters not initialized. Call initRateLimiters() first.');
  }
  return limiters.auth;
}

/**
 * Get AI endpoints rate limiter: 10 requests per hour
 */
export function getAiLimiter(): RateLimitRequestHandler {
  if (!limiters.ai) {
    throw new Error('Rate limiters not initialized. Call initRateLimiters() first.');
  }
  return limiters.ai;
}

/**
 * Get public menu rate limiter: 200 requests per minute
 */
export function getPublicMenuLimiter(): RateLimitRequestHandler {
  if (!limiters.publicMenu) {
    throw new Error('Rate limiters not initialized. Call initRateLimiters() first.');
  }
  return limiters.publicMenu;
}

/**
 * Get file upload rate limiter: 20 uploads per hour
 */
export function getUploadLimiter(): RateLimitRequestHandler {
  if (!limiters.upload) {
    throw new Error('Rate limiters not initialized. Call initRateLimiters() first.');
  }
  return limiters.upload;
}
