import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  duration?: number;
}

type LogListener = (entry: LogEntry) => void;

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
};

const LEVEL_COLORS: Record<LogLevel, { icon: string; color: string; label: string }> = {
  debug:   { icon: '─', color: ANSI.gray,          label: 'DBG' },
  info:    { icon: '●', color: ANSI.brightBlue,    label: 'INF' },
  success: { icon: '✔', color: ANSI.brightGreen,   label: 'OK ' },
  warn:    { icon: '⚠', color: ANSI.brightYellow,  label: 'WRN' },
  error:   { icon: '✘', color: ANSI.brightRed,     label: 'ERR' },
};

const CATEGORY_COLORS: Record<string, string> = {
  'App':          ANSI.brightCyan,
  'IPC':          ANSI.cyan,
  'Runner':       ANSI.brightBlue,
  'Project':      ANSI.blue,
  'Logger':       ANSI.gray,
  'Process':      ANSI.white,
  'Renderer':     ANSI.magenta,
  'WebContainer': ANSI.brightMagenta,
  'PreWarm':      ANSI.brightCyan,
  'NPM':          ANSI.yellow,
  'DevServer':    ANSI.brightGreen,
  'FileSystem':   ANSI.gray,
  'Pipeline':     ANSI.brightMagenta,
  'AutoRunner':   ANSI.brightBlue,
  'CodeGen':      ANSI.brightMagenta,
  'Validator':    ANSI.green,
  'ErrorFix':     ANSI.brightRed,
  'Cache':        ANSI.brightCyan,
  'npm':          ANSI.yellow,
};

class ElectronLogger {
  private logDir: string;
  private logFile: string;
  private listeners: LogListener[] = [];
  private buffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private minLevel: LogLevel = 'debug';
  private timers: Map<string, number> = new Map();
  
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    success: 2,
    warn: 3,
    error: 4
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

  private formatTime(): string {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  }

  private formatFileEntry(entry: LogEntry): string {
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    const durStr = entry.duration != null ? ` (${entry.duration}ms)` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase().padEnd(7)}] [${entry.category.padEnd(12)}] ${entry.message}${durStr}${dataStr}`;
  }

  log(level: LogLevel, category: string, message: string, data?: any, duration?: number): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      duration,
    };

    const lvl = LEVEL_COLORS[level];
    const catColor = CATEGORY_COLORS[category] || ANSI.white;
    const timeStr = this.formatTime();
    const durStr = duration != null ? ` ${ANSI.dim}(${duration}ms)${ANSI.reset}` : '';
    const catPad = category.padEnd(12);

    const line = `${ANSI.gray}${timeStr}${ANSI.reset} ${lvl.color}${lvl.icon} ${lvl.label}${ANSI.reset} ${catColor}${ANSI.bold}[${catPad}]${ANSI.reset} ${message}${durStr}`;
    
    switch (level) {
      case 'error': console.error(line); break;
      case 'warn': console.warn(line); break;
      default: console.log(line);
    }

    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      for (const [key, value] of Object.entries(data)) {
        const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
        console.log(`${ANSI.gray}                          └ ${key}: ${val}${ANSI.reset}`);
      }
    }

    try {
      fs.appendFileSync(this.logFile, this.formatFileEntry(entry) + '\n');
    } catch (err) {
      console.error('Failed to write log:', err);
    }

    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

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

  success(category: string, message: string, data?: any, duration?: number): void {
    this.log('success', category, message, data, duration);
  }

  warn(category: string, message: string, data?: any, duration?: number): void {
    this.log('warn', category, message, data, duration);
  }

  error(category: string, message: string, data?: any, duration?: number): void {
    this.log('error', category, message, data, duration);
  }

  ipc(channel: string, direction: 'in' | 'out', data?: any): void {
    const arrow = direction === 'in' ? '>>>' : '<<<';
    this.debug('IPC', `${arrow} ${channel}`, data);
  }

  process(source: string, output: string): void {
    const lines = output.split('\n').filter(Boolean);
    lines.forEach(line => {
      if (line.toLowerCase().includes('error') || line.toLowerCase().includes('err!')) {
        this.error(source, line);
      } else if (line.toLowerCase().includes('warn')) {
        this.warn(source, line);
      } else {
        this.info(source, line);
      }
    });
  }

  startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  endTimer(label: string): number {
    const start = this.timers.get(label);
    if (start == null) return 0;
    this.timers.delete(label);
    return Date.now() - start;
  }

  separator(label?: string): void {
    const line = label
      ? `─── ${label} ${'─'.repeat(Math.max(0, 50 - label.length))}`
      : '─'.repeat(60);
    console.log(`${ANSI.gray}${line}${ANSI.reset}`);
    try {
      fs.appendFileSync(this.logFile, line + '\n');
    } catch { /* ignore */ }
  }

  group(category: string, title: string): void {
    const catColor = CATEGORY_COLORS[category] || ANSI.white;
    console.log(`${catColor}${ANSI.bold}▼ [${category}] ${title}${ANSI.reset}`);
  }

  groupEnd(): void {
    console.log(`${ANSI.gray}▲ end${ANSI.reset}`);
  }

  subscribe(listener: LogListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  getRecentLogs(count = 100): LogEntry[] {
    return this.buffer.slice(-count);
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.buffer.filter(e => e.level === level);
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.buffer.filter(e => e.category === category);
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
    this.info('Logger', `Log level set to ${level}`);
  }

  getLogFilePath(): string {
    return this.logFile;
  }

  clearBuffer(): void {
    this.buffer = [];
    this.info('Logger', 'Log buffer cleared');
  }

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
