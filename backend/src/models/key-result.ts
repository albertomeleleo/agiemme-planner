import { pool } from '../lib/database';

/**
 * KeyResult model
 * Per data-model.md KeyResult entity schema
 */

export type KeyResultStatus = 'not_started' | 'in_progress' | 'completed' | 'at_risk';

export interface KeyResult {
  id: string;
  objectiveId: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  completionPercentage: number; // Computed field
  status: KeyResultStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKeyResultData {
  objectiveId: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: Date;
  currentValue?: number;
}

export interface UpdateKeyResultData {
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: Date;
}

/**
 * Create a new key result
 */
export async function createKeyResult(data: CreateKeyResultData): Promise<KeyResult> {
  const query = `
    INSERT INTO key_results (objective_id, description, target_value, current_value, unit, deadline)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, objective_id, description, target_value, current_value, unit,
              deadline, status, created_at, updated_at
  `;

  const values = [
    data.objectiveId,
    data.description,
    data.targetValue,
    data.currentValue || 0,
    data.unit,
    data.deadline,
  ];

  const result = await pool.query(query, values);
  return mapRowToKeyResult(result.rows[0]);
}

/**
 * Find key result by ID
 */
export async function findKeyResultById(id: string): Promise<KeyResult | null> {
  const query = `
    SELECT id, objective_id, description, target_value, current_value, unit,
           deadline, status, created_at, updated_at
    FROM key_results
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToKeyResult(result.rows[0]);
}

/**
 * Find all key results for an objective
 */
export async function findKeyResultsByObjectiveId(objectiveId: string): Promise<KeyResult[]> {
  const query = `
    SELECT id, objective_id, description, target_value, current_value, unit,
           deadline, status, created_at, updated_at
    FROM key_results
    WHERE objective_id = $1
    ORDER BY created_at ASC
  `;

  const result = await pool.query(query, [objectiveId]);

  return result.rows.map(mapRowToKeyResult);
}

/**
 * Update key result
 */
export async function updateKeyResult(
  id: string,
  data: UpdateKeyResultData
): Promise<KeyResult | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }

  if (data.targetValue !== undefined) {
    updates.push(`target_value = $${paramIndex++}`);
    values.push(data.targetValue);
  }

  if (data.currentValue !== undefined) {
    updates.push(`current_value = $${paramIndex++}`);
    values.push(data.currentValue);
  }

  if (data.unit !== undefined) {
    updates.push(`unit = $${paramIndex++}`);
    values.push(data.unit);
  }

  if (data.deadline !== undefined) {
    updates.push(`deadline = $${paramIndex++}`);
    values.push(data.deadline);
  }

  if (updates.length === 0) {
    return await findKeyResultById(id);
  }

  values.push(id);

  const query = `
    UPDATE key_results
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING id, objective_id, description, target_value, current_value, unit,
              deadline, status, created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToKeyResult(result.rows[0]);
}

/**
 * Delete key result
 */
export async function deleteKeyResult(id: string): Promise<boolean> {
  const query = 'DELETE FROM key_results WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Get at-risk key results (status = 'at_risk')
 */
export async function getAtRiskKeyResults(userId: string): Promise<KeyResult[]> {
  const query = `
    SELECT kr.id, kr.objective_id, kr.description, kr.target_value, kr.current_value,
           kr.unit, kr.deadline, kr.status, kr.created_at, kr.updated_at
    FROM key_results kr
    JOIN objectives o ON kr.objective_id = o.id
    WHERE o.user_id = $1 AND kr.status = 'at_risk'
    ORDER BY kr.deadline ASC
  `;

  const result = await pool.query(query, [userId]);

  return result.rows.map(mapRowToKeyResult);
}

/**
 * Calculate completion percentage
 */
function calculateCompletionPercentage(currentValue: number, targetValue: number): number {
  if (targetValue === 0) {
    return 0;
  }
  return Math.min((currentValue / targetValue) * 100, 100);
}

/**
 * Map database row to KeyResult type
 */
function mapRowToKeyResult(row: any): KeyResult {
  const completionPercentage = calculateCompletionPercentage(
    parseFloat(row.current_value),
    parseFloat(row.target_value)
  );

  return {
    id: row.id,
    objectiveId: row.objective_id,
    description: row.description,
    targetValue: parseFloat(row.target_value),
    currentValue: parseFloat(row.current_value),
    unit: row.unit,
    deadline: new Date(row.deadline),
    completionPercentage: Math.round(completionPercentage * 100) / 100, // Round to 2 decimals
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
