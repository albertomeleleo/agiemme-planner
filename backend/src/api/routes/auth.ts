import { Router, Request, Response } from 'express';
import * as UserModel from '../../models/user';
import * as AuthService from '../../services/auth-service';
import { createError } from '../middleware/error-handler';
import { requireAuth } from '../middleware/auth';

/**
 * Authentication routes
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login user
 * POST /api/auth/logout - Logout user (invalidate token)
 * GET /api/auth/me - Get current user profile
 */

const router = Router();

/**
 * Register new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw createError('Email, password, firstName, and lastName are required', 400, 'MISSING_FIELDS');
    }

    if (password.length < 8) {
      throw createError('Password must be at least 8 characters long', 400, 'INVALID_PASSWORD');
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError('Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Check if user already exists
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      throw createError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create user
    const user = await UserModel.createUser({
      email,
      password,
      firstName,
      lastName,
    });

    // Generate JWT token
    const authToken = AuthService.generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token: authToken.token,
      expiresIn: authToken.expiresIn,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw createError('Email and password are required', 400, 'MISSING_FIELDS');
    }

    // Verify credentials
    const user = await UserModel.verifyUserCredentials(email, password);
    if (!user) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const authToken = AuthService.generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token: authToken.token,
      expiresIn: authToken.expiresIn,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Logout user
 * Note: JWT tokens are stateless, so logout is handled client-side by removing the token
 * This endpoint exists for consistency and future token blacklisting if needed
 */
router.post('/logout', requireAuth, async (_req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Get current user profile
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
