import fs from 'fs';
import path from 'path';

export class Logger {
  private static logFilePath = path.join(process.cwd(), 'crawl.log');

  private static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  private static writeToFile(msg: string) {
    try {
      fs.appendFileSync(this.logFilePath, msg + '\n', 'utf8');
    } catch (err) {
      console.error('Failed to write to crawl.log:', err);
    }
  }

  public static info(message: string) {
    const consoleMsg = `\x1b[36mℹ\x1b[0m [INFO] ${message}`;
    const fileMsg = this.formatMessage('INFO', message);
    console.log(consoleMsg);
    this.writeToFile(fileMsg);
  }

  public static success(message: string) {
    const consoleMsg = `\x1b[32m✔\x1b[0m [SUCCESS] ${message}`;
    const fileMsg = this.formatMessage('SUCCESS', message);
    console.log(consoleMsg);
    this.writeToFile(fileMsg);
  }

  public static warn(message: string) {
    const consoleMsg = `\x1b[33m⚠\x1b[0m [WARN] ${message}`;
    const fileMsg = this.formatMessage('WARN', message);
    console.warn(consoleMsg);
    this.writeToFile(fileMsg);
  }

  public static error(message: string, error?: any) {
    const errorDetail = error ? ` - ${error.message || String(error)}` : '';
    const consoleMsg = `\x1b[31m✖\x1b[0m [ERROR] ${message}${errorDetail}`;
    const fileMsg = this.formatMessage('ERROR', `${message}${errorDetail}`);
    console.error(consoleMsg);
    this.writeToFile(fileMsg);
    if (error && error.stack) {
      this.writeToFile(error.stack);
    }
  }

  public static clear() {
    try {
      if (fs.existsSync(this.logFilePath)) {
        fs.unlinkSync(this.logFilePath);
      }
    } catch {
      // Ignore
    }
  }
}
