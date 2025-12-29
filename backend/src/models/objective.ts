import { pool } from '../lib/database';

/**
 * Objective model
 * Per data-model.md Objective entity schema
 */

export type ObjectiveCategory =
  | 'career'
  | 'health'
  | 'relationships'
  | 'skills'
  | 'financial'
  | 'personal';

export type ObjectiveStatus = 'active' | 'completed' | 'archived' | 'abandoned';

export interface Objective {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: ObjectiveCategory;
  targetDate: Date;
  status: ObjectiveStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateObjectiveData {
  userId: string;
  title: string;
  description?: string;
  category: ObjectiveCategory;
  targetDate: Date;
}

export interface UpdateObjectiveData {
  title?: string;
  description?: string;
  category?: ObjectiveCategory;
  targetDate?: Date;
  status?: ObjectiveStatus;
}

/**
 * Create a new objective
 */
export async function createObjective(data: CreateObjectiveData): Promise<Objective> {
  const query = `
    INSERT INTO objectives (user_id, title, description, category, target_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, title, description, category, target_date,
              status, created_at, updated_at
  `;

  const values = [data.userId, data.title, data.description || null, data.category, data.targetDate];

  const result = await pool.query(query, values);
  return mapRowToObjective(result.rows[0]);
}

/**
 * Find objective by ID
 */
export async function findObjectiveById(id: string): Promise<Objective | null> {
  const query = `
    SELECT id, user_id, title, description, category, target_date,
           status, created_at, updated_at
    FROM objectives
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToObjective(result.rows[0]);
}

/**
 * Find all objectives for a user
 */
export async function findObjectivesByUserId(
  userId: string,
  filters?: {
    category?: ObjectiveCategory;
    status?: ObjectiveStatus;
  }
): Promise<Objective[]> {
  let query = `
    SELECT id, user_id, title, description, category, target_date,
           status, created_at, updated_at
    FROM objectives
    WHERE user_id = $1
  `;

  const values: any[] = [userId];
  let paramIndex = 2;

  if (filters?.category) {
    query += ` AND category = $${paramIndex}`;
    values.push(filters.category);
    paramIndex++;
  }

  if (filters?.status) {
    query += ` AND status = $${paramIndex}`;
    values.push(filters.status);
    paramIndex++;
  }

  query += ` ORDER BY target_date ASC, created_at DESC`;

  const result = await pool.query(query, values);

  return result.rows.map(mapRowToObjective);
}

/**
 * Update objective
 */
export async function updateObjective(
  id: string,
  data: UpdateObjectiveData
): Promise<Objective | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }

  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }

  if (data.category !== undefined) {
    updates.push(`category = $${paramIndex++}`);
    values.push(data.category);
  }

  if (data.targetDate !== undefined) {
    updates.push(`target_date = $${paramIndex++}`);
    values.push(data.targetDate);
  }

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }

  if (updates.length === 0) {
    return await findObjectiveById(id);
  }

  values.push(id);

  const query = `
    UPDATE objectives
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING id, user_id, title, description, category, target_date,
              status, created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToObjective(result.rows[0]);
}

/**
 * Delete objective (cascades to key results)
 */
export async function deleteObjective(id: string): Promise<boolean> {
  const query = 'DELETE FROM objectives WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Map database row to Objective type
 */
function mapRowToObjective(row: any): Objective {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    targetDate: new Date(row.target_date),
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
