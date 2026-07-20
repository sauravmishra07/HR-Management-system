import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../../logs');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaKeys = Object.keys(meta).filter((k) => k !== 'service');
  const metaStr = metaKeys.length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}] ${stack || message}${metaStr}`;
});

/**
 * Winston logger. Console (pretty, dev) + rotating files for combined and error logs.
 * Used for auth events, business events (payroll, leave approval) and errors.
 */
const logger = winston.createLogger({
  level: config.isProd ? 'info' : 'debug',
  defaultMeta: { service: 'ramp-hrms' },
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json()),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', maxsize: 5_242_880, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log'), maxsize: 5_242_880, maxFiles: 5 }),
  ],
  exitOnError: false,
});

if (!config.isProd) {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), consoleFormat),
    })
  );
}

// Stream adapter so Morgan writes HTTP logs through Winston.
export const morganStream = {
  write: (message) => logger.http?.(message.trim()) ?? logger.info(message.trim()),
};

export default logger;
