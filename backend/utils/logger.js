// utils/logger.js

const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define custom log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }), // Include stack trace
  format.splat(),
  format.json()
);

// Define the log directory and file names
const logDirectory = path.resolve(__dirname, '../logs');
const errorLogFile = path.join(logDirectory, 'error.log');
const combinedLogFile = path.join(logDirectory, 'combined.log');

// Create the logger instance
const logger = createLogger({
  level: 'info', // Default log level
  format: logFormat,
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    new transports.File({ filename: errorLogFile, level: 'error' }),

    // - Write all logs with level `info` and below to `combined.log`
    new transports.File({ filename: combinedLogFile }),

    // - If we're not in production then log to the `console` with the simple format
    new transports.Console({
      format: format.combine(
        format.colorize(), // Colorize the output
        format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `${timestamp} [${level}]: ${message} - ${stack}`
            : `${timestamp} [${level}]: ${message}`;
        })
      ),
      level: 'debug', // Console log level
    }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

// Create a stream object for morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new transports.File({ filename: path.join(logDirectory, 'exceptions.log') })
);

logger.rejections.handle(
  new transports.File({ filename: path.join(logDirectory, 'rejections.log') })
);

module.exports = logger;
