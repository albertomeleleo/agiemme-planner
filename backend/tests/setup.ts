/**
 * Vitest setup for backend tests
 * Per Constitution Section II: Testing Discipline
 */

import { beforeAll, afterAll } from 'vitest';
import { pool, testConnection } from '../src/lib/database';

// Test database connection before running tests
beforeAll(async () => {
  console.log('[Test Setup] Connecting to test database...');
  const connected = await testConnection();
  if (!connected) {
    throw new Error('Failed to connect to test database');
  }
  console.log('[Test Setup] Database connection successful');
});

// Close database connection after all tests
afterAll(async () => {
  console.log('[Test Setup] Closing database connection...');
  await pool.end();
  console.log('[Test Setup] Cleanup complete');
});

// Global test timeout
export const TEST_TIMEOUT = 5000; // <5s per constitution
