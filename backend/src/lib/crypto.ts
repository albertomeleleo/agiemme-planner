import bcrypt from 'bcrypt';

/**
 * Password hashing utilities using bcrypt
 * Per Constitution Section: Security hardening
 */

const SALT_ROUNDS = 12; // Strong hashing (2^12 iterations)

/**
 * Hash a plaintext password
 * @param password - Plaintext password (minimum 8 characters)
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 * @param password - Plaintext password to verify
 * @param hash - Stored password hash
 * @returns Promise<boolean> - true if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Check if password meets security requirements
 * @param password - Password to validate
 * @returns {valid: boolean, errors: string[]}
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
