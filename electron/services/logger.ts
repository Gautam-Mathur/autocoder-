import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

type LogListener = (entry: LogEntry) => void;

class ElectronLogger {
  private logDir: string;
  private logFile: string;
  private listeners: LogListener[] = [];
  private buffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private minLevel: LogLevel = 'debug';
  
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor() {
    try {
      this.logDir = path.join(app.getPath('userData'), 'logs');
    } catch {
      this.logDir = path.join(process.cwd(), 'logs');
    }
    
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(this.logDir, `autocoder-${date}.log`);
    
    this.info('Logger', 'Logger initialized', { logFile: this.logFile });
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}${dataStr}`;
  }

  log(level: LogLevel, category: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    // Console output with colors
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m',  // Cyan
      info: '\x1b[32m',   // Green
      warn: '\x1b[33m',   // Yellow
      error: '\x1b[31m'   // Red
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}${this.formatEntry(entry)}${reset}`);

    // File output
    try {
      fs.appendFileSync(this.logFile, this.formatEntry(entry) + '\n');
    } catch (err) {
      console.error('Failed to write log:', err);
    }

    // Buffer for UI
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (err) {
        console.error('Log listener error:', err);
      }
    });
  }

  debug(category: string, message: string, data?: any): void {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.log('error', category, message, data);
  }

  // IPC event logging
  ipc(channel: string, direction: 'in' | 'out', data?: any): void {
    const arrow = direction === 'in' ? '>>>' : '<<<';
    this.debug('IPC', `${arrow} ${channel}`, data);
  }

  // Process output logging (npm, dev server, etc.)
  process(source: string, output: string): void {
    const lines = output.split('\n').filter(Boolean);
    lines.forEach(line => {
      if (line.toLowerCase().includes('error')) {
        this.error(source, line);
      } else if (line.toLowerCase().includes('warn')) {
        this.warn(source, line);
      } else {
        this.info(source, line);
      }
    });
  }

  // Subscribe to log events
  subscribe(listener: LogListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  // Get recent logs
  getRecentLogs(count = 100): LogEntry[] {
    return this.buffer.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.buffer.filter(e => e.level === level);
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.buffer.filter(e => e.category === category);
  }

  // Set minimum log level
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
    this.info('Logger', `Log level set to ${level}`);
  }

  // Get log file path
  getLogFilePath(): string {
    return this.logFile;
  }

  // Clear buffer
  clearBuffer(): void {
    this.buffer = [];
    this.info('Logger', 'Log buffer cleared');
  }

  // Rotate logs (keep last 7 days)
  rotateLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(f => f.startsWith('autocoder-') && f.endsWith('.log'))
        .sort();
      
      while (files.length > 7) {
        const oldest = files.shift();
        if (oldest) {
          fs.unlinkSync(path.join(this.logDir, oldest));
          this.info('Logger', `Deleted old log: ${oldest}`);
        }
      }
    } catch (err) {
      this.error('Logger', 'Failed to rotate logs', { error: String(err) });
    }
  }
}

export const logger = new ElectronLogger();
