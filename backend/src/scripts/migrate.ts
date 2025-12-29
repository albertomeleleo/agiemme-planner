import { promises as fs } from 'fs';
import path from 'path';
import { pool } from '../lib/database';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database migration runner
 * Runs SQL migration files in order
 */

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

interface Migration {
  id: number;
  filename: string;
  appliedAt: Date;
}

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await pool.query(query);
  console.log('[Migrate] Migrations table ready');
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(): Promise<Migration[]> {
  const query = 'SELECT id, filename, applied_at FROM migrations ORDER BY id';
  const result = await pool.query(query);

  return result.rows.map((row: any) => ({
    id: row.id,
    filename: row.filename,
    appliedAt: new Date(row.applied_at),
  }));
}

/**
 * Get list of migration files
 */
async function getMigrationFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    return files
      .filter((f) => f.endsWith('.sql'))
      .sort(); // Sort alphabetically (relies on numeric prefix)
  } catch (error) {
    console.error('[Migrate] Error reading migrations directory:', error);
    throw error;
  }
}

/**
 * Run a single migration
 */
async function runMigration(filename: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = await fs.readFile(filePath, 'utf-8');

  console.log(`[Migrate] Running migration: ${filename}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
    await client.query('COMMIT');
    console.log(`[Migrate] ✓ ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`[Migrate] ✗ ${filename} - Error:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rollback a single migration
 */
async function rollbackMigration(filename: string): Promise<void> {
  console.log(`[Migrate] Rolling back: ${filename}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM migrations WHERE filename = $1', [filename]);
    await client.query('COMMIT');
    console.log(`[Migrate] ✓ Rolled back ${filename}`);
    console.log('[Migrate] Note: Rollback only removed tracking. SQL rollback must be done manually.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`[Migrate] ✗ Error rolling back ${filename}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all pending migrations
 */
async function migrateUp(): Promise<void> {
  console.log('[Migrate] Starting migrations...\n');

  await createMigrationsTable();

  const appliedMigrations = await getAppliedMigrations();
  const appliedFilenames = new Set(appliedMigrations.map((m) => m.filename));

  const migrationFiles = await getMigrationFiles();
  const pendingMigrations = migrationFiles.filter((f) => !appliedFilenames.has(f));

  if (pendingMigrations.length === 0) {
    console.log('[Migrate] No pending migrations');
    return;
  }

  console.log(`[Migrate] Found ${pendingMigrations.length} pending migration(s)\n`);

  for (const filename of pendingMigrations) {
    await runMigration(filename);
  }

  console.log('\n[Migrate] All migrations completed successfully');
}

/**
 * Rollback the last migration
 */
async function migrateDown(): Promise<void> {
  console.log('[Migrate] Rolling back last migration...\n');

  await createMigrationsTable();

  const appliedMigrations = await getAppliedMigrations();

  if (appliedMigrations.length === 0) {
    console.log('[Migrate] No migrations to rollback');
    return;
  }

  const lastMigration = appliedMigrations[appliedMigrations.length - 1];
  if (!lastMigration) {
    console.log('[Migrate] No migrations to rollback');
    return;
  }
  await rollbackMigration(lastMigration.filename);

  console.log('\n[Migrate] Rollback completed');
}

/**
 * Show migration status
 */
async function status(): Promise<void> {
  console.log('[Migrate] Migration Status\n');

  await createMigrationsTable();

  const appliedMigrations = await getAppliedMigrations();
  const appliedFilenames = new Set(appliedMigrations.map((m) => m.filename));

  const migrationFiles = await getMigrationFiles();

  console.log('Applied migrations:');
  if (appliedMigrations.length === 0) {
    console.log('  (none)');
  } else {
    for (const migration of appliedMigrations) {
      console.log(`  ✓ ${migration.filename} (${migration.appliedAt.toISOString()})`);
    }
  }

  const pendingMigrations = migrationFiles.filter((f) => !appliedFilenames.has(f));

  console.log('\nPending migrations:');
  if (pendingMigrations.length === 0) {
    console.log('  (none)');
  } else {
    for (const filename of pendingMigrations) {
      console.log(`  ○ ${filename}`);
    }
  }

  console.log(`\nTotal: ${appliedMigrations.length} applied, ${pendingMigrations.length} pending`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
        await migrateUp();
        break;
      case 'down':
        await migrateDown();
        break;
      case 'status':
        await status();
        break;
      default:
        console.log('Usage: npm run migrate:up | migrate:down | migrate:status');
        process.exit(1);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('[Migrate] Fatal error:', error);
    await pool.end();
    process.exit(1);
  }
}

main();
