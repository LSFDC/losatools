import path from "path";
import * as fs from "fs";

/**
 * Writes a message to a log file.
 *
 * @param message The message to be written to the log file.
 * @param filename The name of the log file to be written to.
 *
 * The log message will be prefixed with the current date and time in ISO format.
 * If the log directory does not exist, it will be created.
 * The log file will be created if it does not exist, or appended to if it does.
 */
export function WriteLog(message: string, filename: string) {
  const logDirPath = "./log";
  const logFilePath = path.join(logDirPath, filename);

  if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFilePath, logMessage, "utf8");
}
