import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken, TokenPayload } from '../../services/auth-service';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * Per Constitution: Stateless design, no session storage
 */

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to require authentication
 * Verifies JWT token from Authorization header
 * Attaches decoded user to req.user
 *
 * @returns 401 if no token or invalid token
 * @returns 403 if token expired
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const token = extractToken(req.headers.authorization);

    // Verify and decode token
    const user = verifyToken(token);

    // Attach user to request for downstream handlers
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(403).json({
          error: {
            message: 'Token expired. Please login again.',
            code: 'TOKEN_EXPIRED',
          },
        });
        return;
      }

      if (
        error.message === 'Invalid token' ||
        error.message === 'No authorization header' ||
        error.message === 'Invalid authorization header format' ||
        error.message === 'No token provided'
      ) {
        res.status(401).json({
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }
    }

    // Generic error
    res.status(401).json({
      error: {
        message: 'Authentication failed',
        code: 'AUTH_FAILED',
      },
    });
  }
}

/**
 * Optional authentication middleware
 * If token provided, verifies and attaches user
 * If no token, continues without user
 * Useful for endpoints that behave differently when authenticated
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = extractToken(authHeader);
      const user = verifyToken(token);
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without user if token invalid
    next();
  }
}

/**
 * Middleware to check if user owns a resource
 * Use after requireAuth() to verify ownership
 *
 * @param getUserIdFromParams - Function to extract user ID from request params/body
 */
export function requireOwnership(
  getUserIdFromParams: (req: Request) => string
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    const resourceUserId = getUserIdFromParams(req);

    if (req.user.userId !== resourceUserId) {
      res.status(403).json({
        error: {
          message: 'Access forbidden: You do not own this resource',
          code: 'FORBIDDEN',
        },
      });
      return;
    }

    next();
  };
}
