export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  details?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      details,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const prefix = `[${level.toUpperCase()}]`;
    switch (level) {
      case 'error':
        console.error(prefix, message, details);
        break;
      case 'warn':
        console.warn(prefix, message, details);
        break;
      case 'debug':
        console.debug(prefix, message, details);
        break;
      default:
        console.log(prefix, message, details);
    }

    return entry;
  }

  info(message: string, details?: any) {
    return this.log('info', message, details);
  }

  warn(message: string, details?: any) {
    return this.log('warn', message, details);
  }

  error(message: string, details?: any) {
    return this.log('error', message, details);
  }

  debug(message: string, details?: any) {
    return this.log('debug', message, details);
  }

  success(message: string, details?: any) {
    return this.log('success', message, details);
  }

  getLogs(limit?: number): LogEntry[] {
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
