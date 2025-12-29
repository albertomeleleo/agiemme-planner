import { Router, Request, Response } from 'express';
import pool from '@/lib/database';

const router = Router();

/**
 * Health Check Endpoint
 * Returns: JSON with status, timestamp, database connection state
 * Reference: data-model.md Health Endpoint Contract
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    // Return healthy response
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    // Return unhealthy response if database connection fails
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error'
    });
  }
});

export default router;
