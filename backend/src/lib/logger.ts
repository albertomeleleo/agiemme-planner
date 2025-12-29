import winston from 'winston';

/**
 * Logging infrastructure using Winston
 * Per Constitution Section VI: Monitoring & Observability
 */

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'agiemme-planner-backend',
  },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    // File logging for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // File logging for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Create logs directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

export default logger;
