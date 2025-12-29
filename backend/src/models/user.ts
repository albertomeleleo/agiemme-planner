import { pool } from '../lib/database';
import { hashPassword, verifyPassword } from '../lib/crypto';

/**
 * User model
 * Per data-model.md User entity schema
 * Represents a person using the system for personal growth planning
 */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  timezone: string;
  notificationPreferences: {
    email: boolean;
    reminderHours: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: string;
  notificationPreferences?: {
    email?: boolean;
    reminderHours?: number;
  };
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  timezone?: string;
  notificationPreferences?: {
    email?: boolean;
    reminderHours?: number;
  };
}

/**
 * Create a new user
 * @param userData - User registration data
 * @returns Created user (without password hash)
 */
export async function createUser(userData: CreateUserData): Promise<Omit<User, 'passwordHash'>> {
  // Hash password
  const passwordHash = await hashPassword(userData.password);

  // Default values
  const timezone = userData.timezone || 'UTC';
  const notificationPreferences = {
    email: userData.notificationPreferences?.email ?? true,
    reminderHours: userData.notificationPreferences?.reminderHours ?? 24,
  };

  const query = `
    INSERT INTO users (email, password_hash, first_name, last_name, timezone, notification_preferences)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, first_name, last_name, timezone, notification_preferences, created_at, updated_at
  `;

  const values = [
    userData.email,
    passwordHash,
    userData.firstName,
    userData.lastName,
    timezone,
    JSON.stringify(notificationPreferences),
  ];

  const result = await pool.query(query, values);
  const row = result.rows[0];

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    timezone: row.timezone,
    notificationPreferences: row.notification_preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Find user by email (for login)
 * @param email - User email
 * @returns User with password hash or null
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const query = `
    SELECT id, email, password_hash, first_name, last_name, timezone,
           notification_preferences, created_at, updated_at
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    timezone: row.timezone,
    notificationPreferences: row.notification_preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Find user by ID
 * @param id - User ID (UUID)
 * @returns User without password hash or null
 */
export async function findUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
  const query = `
    SELECT id, email, first_name, last_name, timezone,
           notification_preferences, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    timezone: row.timezone,
    notificationPreferences: row.notification_preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Update user profile
 * @param id - User ID
 * @param updateData - Fields to update
 * @returns Updated user or null
 */
export async function updateUser(
  id: string,
  updateData: UpdateUserData
): Promise<Omit<User, 'passwordHash'> | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updateData.firstName !== undefined) {
    updates.push(`first_name = $${paramIndex++}`);
    values.push(updateData.firstName);
  }

  if (updateData.lastName !== undefined) {
    updates.push(`last_name = $${paramIndex++}`);
    values.push(updateData.lastName);
  }

  if (updateData.timezone !== undefined) {
    updates.push(`timezone = $${paramIndex++}`);
    values.push(updateData.timezone);
  }

  if (updateData.notificationPreferences !== undefined) {
    updates.push(`notification_preferences = $${paramIndex++}`);
    values.push(JSON.stringify(updateData.notificationPreferences));
  }

  if (updates.length === 0) {
    // No updates to perform
    return await findUserById(id);
  }

  values.push(id);

  const query = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING id, email, first_name, last_name, timezone,
              notification_preferences, created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    timezone: row.timezone,
    notificationPreferences: row.notification_preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Verify user credentials (for login)
 * @param email - User email
 * @param password - Plaintext password
 * @returns User without password hash if credentials valid, null otherwise
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<Omit<User, 'passwordHash'> | null> {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Delete user account
 * @param id - User ID
 * @returns true if deleted, false if not found
 */
export async function deleteUser(id: string): Promise<boolean> {
  const query = 'DELETE FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}
