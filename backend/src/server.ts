import app from './app';
import { connectDatabase, disconnectDatabase } from './lib/database';

/**
 * Server entry point
 * Starts Express server and connects to database
 */

const PORT = process.env.PORT || 3000;

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    console.log('[Server] Connecting to database...');
    await connectDatabase();
    console.log('[Server] Database connected successfully');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`[Server] Server running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n[Server] ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('[Server] HTTP server closed');

        try {
          await disconnectDatabase();
          console.log('[Server] Database disconnected');
          process.exit(0);
        } catch (error) {
          console.error('[Server] Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('[Server] Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
