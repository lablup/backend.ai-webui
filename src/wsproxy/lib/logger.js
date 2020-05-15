const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

const logger = function(name) {
  return createLogger({
  // change level if in dev environment versus production
  level: env === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.label({ label: path.basename(name) }),
    format.timestamp({ format: 'MM-DD HH:mm:ss' })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
      )
    }),
  ]
});
};

module.exports = logger;
