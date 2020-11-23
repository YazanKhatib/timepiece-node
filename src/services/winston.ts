import winston from 'winston';

export const Logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5,
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

Logger.stream = {
  // @ts-ignore
  write(message) {
    Logger.info(message);
  },
};
