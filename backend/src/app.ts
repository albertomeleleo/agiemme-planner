import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, createError } from './api/middleware/error-handler';

// Route imports
import authRoutes from './api/routes/auth';
import objectivesRoutes from './api/routes/objectives';
import keyResultsRoutes from './api/routes/key-results';
import healthRoutes from './api/routes/health';

/**
 * Express application setup
 * Configures middleware, routes, and error handling
 */

const app: Application = express();

// Security middleware
app.use(helmet()); // Security headers

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API routes
app.use('/api/health', healthRoutes); // Health check with database connection test
app.use('/api/auth', authRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/key-results', keyResultsRoutes);

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = createError('Route not found', 404, 'NOT_FOUND');
  next(error);
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
