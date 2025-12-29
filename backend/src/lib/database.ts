import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL connection configuration
 * Per Constitution Section VI: Performance Requirements
 * - Connection pooling configured
 * - Ready for horizontal scaling (stateless design)
 */

const poolConfig: PoolConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME || 'agiemme_planner_dev',
  user: process.env.DATABASE_USER || 'agiemme_user',
  password: process.env.DATABASE_PASSWORD,
  // Connection pool settings
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout on new client connection
};

/**
 * Database connection pool
 * Singleton pattern for efficient connection management
 */
export const pool = new Pool(poolConfig);

/**
 * Connect to database and verify connection
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('[Database] Connection successful:', result.rows[0]);
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await pool.end();
  console.log('[Database] Connection pool closed');
}

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('[Database] Connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    return false;
  }
}

/**
 * Execute a query with connection pooling
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  // Log slow queries (>200ms per constitution)
  if (duration > 200) {
    console.warn(`[Database] Slow query (${duration}ms):`, text);
  }

  return res;
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<any> {
  return await pool.connect();
}

/**
 * Graceful shutdown - close all connections
 * @deprecated Use disconnectDatabase() instead
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('[Database] Connection pool closed');
}
