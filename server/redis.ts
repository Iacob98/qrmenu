import { createClient, type RedisClientType } from 'redis';

// Redis client singleton
let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Get or create Redis client
 * Falls back gracefully if Redis is not available
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient && isConnected) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    console.warn('[Redis] REDIS_URL not set - using localhost (not recommended for production)');
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('[Redis] Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Client error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connecting...');
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Connected and ready');
      isConnected = true;
    });

    redisClient.on('end', () => {
      console.log('[Redis] Connection closed');
      isConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('[Redis] Failed to connect:', error instanceof Error ? error.message : 'Unknown error');
    console.warn('[Redis] Application will continue without Redis caching');
    redisClient = null;
    isConnected = false;
    return null;
  }
}

/**
 * Initialize Redis connection
 * Should be called at application startup
 */
export async function initRedis(): Promise<boolean> {
  const client = await getRedisClient();
  return client !== null;
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return isConnected && redisClient !== null;
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('[Redis] Connection closed gracefully');
    } catch (error) {
      console.error('[Redis] Error closing connection:', error);
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
}

// Export the client getter for direct access when needed
export { redisClient };
