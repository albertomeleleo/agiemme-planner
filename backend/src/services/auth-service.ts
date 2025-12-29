import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * JWT Authentication Service
 * Handles token generation and verification
 * Per Constitution: Stateless design for horizontal scaling
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthToken {
  token: string;
  expiresIn: string;
}

/**
 * Generate JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns AuthToken with JWT and expiration
 */
export function generateToken(payload: TokenPayload): AuthToken {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION as jwt.SignOptions['expiresIn'],
  });

  return {
    token,
    expiresIn: JWT_EXPIRATION,
  };
}

/**
 * Verify and decode JWT token
 * @param token - JWT token from Authorization header
 * @returns TokenPayload if valid
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string without "Bearer " prefix
 */
export function extractToken(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format');
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  if (!token) {
    throw new Error('No token provided');
  }

  return token;
}

/**
 * Refresh token (generate new token with same payload)
 * @param oldToken - Existing valid token
 * @returns New AuthToken
 */
export function refreshToken(oldToken: string): AuthToken {
  const payload = verifyToken(oldToken);
  return generateToken(payload);
}
