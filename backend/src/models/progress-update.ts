import { pool } from '../lib/database';

/**
 * ProgressUpdate model
 * Per data-model.md ProgressUpdate entity schema
 */

export interface ProgressUpdate {
  id: string;
  keyResultId: string;
  valueRecorded: number;
  notes: string | null;
  recordedAt: Date;
}

export interface CreateProgressUpdateData {
  keyResultId: string;
  valueRecorded: number;
  notes?: string;
}

/**
 * Create a new progress update
 * This will automatically trigger update of key result's current_value
 */
export async function createProgressUpdate(
  data: CreateProgressUpdateData
): Promise<ProgressUpdate> {
  const query = `
    INSERT INTO progress_updates (key_result_id, value_recorded, notes)
    VALUES ($1, $2, $3)
    RETURNING id, key_result_id, value_recorded, notes, recorded_at
  `;

  const values = [data.keyResultId, data.valueRecorded, data.notes || null];

  const result = await pool.query(query, values);
  return mapRowToProgressUpdate(result.rows[0]);
}

/**
 * Find progress update by ID
 */
export async function findProgressUpdateById(id: string): Promise<ProgressUpdate | null> {
  const query = `
    SELECT id, key_result_id, value_recorded, notes, recorded_at
    FROM progress_updates
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToProgressUpdate(result.rows[0]);
}

/**
 * Find all progress updates for a key result
 */
export async function findProgressUpdatesByKeyResultId(
  keyResultId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ProgressUpdate[]> {
  let query = `
    SELECT id, key_result_id, value_recorded, notes, recorded_at
    FROM progress_updates
    WHERE key_result_id = $1
  `;

  const values: any[] = [keyResultId];
  let paramIndex = 2;

  if (options?.startDate) {
    query += ` AND recorded_at >= $${paramIndex}`;
    values.push(options.startDate);
    paramIndex++;
  }

  if (options?.endDate) {
    query += ` AND recorded_at <= $${paramIndex}`;
    values.push(options.endDate);
    paramIndex++;
  }

  query += ` ORDER BY recorded_at DESC`;

  const result = await pool.query(query, values);

  return result.rows.map(mapRowToProgressUpdate);
}

/**
 * Delete progress update
 * Note: This won't automatically roll back the key result value
 */
export async function deleteProgressUpdate(id: string): Promise<boolean> {
  const query = 'DELETE FROM progress_updates WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Map database row to ProgressUpdate type
 */
function mapRowToProgressUpdate(row: any): ProgressUpdate {
  return {
    id: row.id,
    keyResultId: row.key_result_id,
    valueRecorded: parseFloat(row.value_recorded),
    notes: row.notes,
    recordedAt: new Date(row.recorded_at),
  };
}
