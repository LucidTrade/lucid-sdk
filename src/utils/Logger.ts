export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export class ConsoleLogger implements ILogger {
  constructor(private level: LogLevel = LogLevel.INFO) {}

  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) console.debug(`[DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) console.info(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) console.error(`[ERROR] ${message}`, ...args);
  }
}
