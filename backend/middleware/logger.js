import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const transport = new DailyRotateFile({
  filename: "logs/app-%DATE%.log", // Format nama file log
  datePattern: "YYYY-MM-DD", // Log per hari
  zippedArchive: true, // Arsipkan dalam .gz
  maxSize: "20m", // Ukuran maksimal per file
  maxFiles: "14d", // Simpan log hanya 14 hari
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    // new winston.transports.Console(),
    transport,
  ],
});

export default logger;
