import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use connection pool with proper error handling and reconnection
// Optimized for 1000+ concurrent users
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX || '25', 10), // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN || '5', 10), // Minimum number of clients to keep ready
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 3000, // Return an error after 3 seconds if connection could not be established
  maxUses: 7500, // Close a connection after it has been used 7500 times
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Pool has ended');
    process.exit(0);
  });
});

export { pool };
export const db = drizzle(pool, { schema });