import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use connection pool with proper error handling and reconnection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
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