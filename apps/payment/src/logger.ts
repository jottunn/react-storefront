import pino from "pino";
import fs from "fs";
import path from "path";
import { createStream } from "rotating-file-stream";

const logDirectory = path.resolve(process.cwd(), "logs");

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a write stream to a log file
// const logFile = path.join(logDirectory, 'app.log');
// const stream = fs.createWriteStream(logFile, { flags: 'a' });
// Create a rotating file stream
const stream = createStream("app.log", {
  interval: "7d",
  size: "5M",
  path: logDirectory,
  maxFiles: 4,
  compress: "gzip",
});
// Create pino logger instance
const logger = pino({ level: "info", base: undefined }, stream);

export default logger;
