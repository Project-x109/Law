const winston = require("winston");
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;
const MongoDB = require("winston-mongodb").MongoDB;
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const logger = createLogger({
  level: "info",
  format: combine(label({ label: "YourApp" }), timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new MongoDB({
      db: "mongodb+srv://amanuelgirma108:gondar2022@cluster0.psqaciy.mongodb.net/?retryWrites=true&w=majority", // Use the existing database connection
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      collection: "logs",
    }),
  ],
});
const logMiddleware = (req, res, next) => {
  // Log request information, errors, or any other relevant data.
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
};
const store = new MongoDBStore({
  uri: 'mongodb+srv://amanuelgirma108:gondar2022@cluster0.psqaciy.mongodb.net/?retryWrites=true&w=majority',
  collection: 'sessions',
});
store.on('error', function (error) {
  console.log(error);
});
const secretKey = 'YourSuperSecretKeyHere1234567890';
module.exports = { logMiddleware, logger, secretKey, store };
