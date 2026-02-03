import { nanoid } from "nanoid";

export type LogLevel = "debug" | "info" | "success" | "warn" | "error";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, unknown>;
  conversationId?: number;
  duration?: number;
}

interface LoggerConfig {
  maxLogs: number;
  persistLogs: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m",
  info: "\x1b[34m",
  success: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

class Logger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig = {
    maxLogs: 1000,
    persistLogs: true,
    minLevel: "debug",
  };
  private listeners: Set<(log: LogEntry) => void> = new Set();

  private formatTimestamp(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const color = LOG_COLORS[entry.level];
    const levelPadded = entry.level.toUpperCase().padEnd(7);
    const timestamp = this.formatTimestamp(entry.timestamp);
    const category = entry.category ? `[${entry.category}]` : "";
    const duration = entry.duration ? `${DIM}(${entry.duration}ms)${RESET}` : "";
    
    return `${DIM}${timestamp}${RESET} ${color}${BOLD}${levelPadded}${RESET} ${category} ${entry.message} ${duration}`;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }

    this.listeners.forEach((listener) => listener(entry));

    if (this.shouldLog(entry.level)) {
      const formattedMessage = this.formatConsoleMessage(entry);
      switch (entry.level) {
        case "error":
          console.error(formattedMessage);
          break;
        case "warn":
          console.warn(formattedMessage);
          break;
        case "debug":
          console.debug(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  private createEntry(
    level: LogLevel,
    category: string,
    message: string,
    details?: Record<string, unknown>,
    conversationId?: number,
    duration?: number
  ): LogEntry {
    return {
      id: nanoid(12),
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      conversationId,
      duration,
    };
  }

  debug(category: string, message: string, details?: Record<string, unknown>): void {
    this.addLog(this.createEntry("debug", category, message, details));
  }

  info(category: string, message: string, details?: Record<string, unknown>): void {
    this.addLog(this.createEntry("info", category, message, details));
  }

  success(category: string, message: string, details?: Record<string, unknown>, duration?: number): void {
    this.addLog(this.createEntry("success", category, message, details, undefined, duration));
  }

  warn(category: string, message: string, details?: Record<string, unknown>): void {
    this.addLog(this.createEntry("warn", category, message, details));
  }

  error(category: string, message: string, details?: Record<string, unknown>): void {
    this.addLog(this.createEntry("error", category, message, details));
  }

  api(method: string, path: string, status: number, duration: number): void {
    const level: LogLevel = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    this.addLog(
      this.createEntry(level, "API", `${method} ${path} → ${status}`, { method, path, status }, undefined, duration)
    );
  }

  ai(action: string, message: string, details?: Record<string, unknown>, duration?: number): void {
    this.addLog(this.createEntry("info", "AI", `${action}: ${message}`, details, undefined, duration));
  }

  db(action: string, table: string, details?: Record<string, unknown>, duration?: number): void {
    this.addLog(this.createEntry("debug", "DB", `${action} on ${table}`, details, undefined, duration));
  }

  security(action: string, message: string, details?: Record<string, unknown>): void {
    this.addLog(this.createEntry("warn", "Security", `${action}: ${message}`, details));
  }

  performance(action: string, duration: number, details?: Record<string, unknown>): void {
    const level: LogLevel = duration > 5000 ? "warn" : duration > 1000 ? "info" : "debug";
    this.addLog(this.createEntry(level, "Perf", action, details, undefined, duration));
  }

  conversation(conversationId: number, action: string, message: string, details?: Record<string, unknown>): void {
    const entry = this.createEntry("info", "Chat", `${action}: ${message}`, details, conversationId);
    this.addLog(entry);
  }

  getLogs(options?: {
    level?: LogLevel;
    category?: string;
    conversationId?: number;
    limit?: number;
    since?: Date;
    search?: string;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (options?.level) {
      const minLevel = LOG_LEVELS[options.level];
      filtered = filtered.filter((log) => LOG_LEVELS[log.level] >= minLevel);
    }

    if (options?.category) {
      filtered = filtered.filter((log) =>
        log.category.toLowerCase().includes(options.category!.toLowerCase())
      );
    }

    if (options?.conversationId) {
      filtered = filtered.filter((log) => log.conversationId === options.conversationId);
    }

    if (options?.since) {
      filtered = filtered.filter((log) => log.timestamp >= options.since!);
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.category.toLowerCase().includes(searchLower)
      );
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered.reverse();
  }

  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
    recentErrors: LogEntry[];
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      success: 0,
      warn: 0,
      error: 0,
    };

    const byCategory: Record<string, number> = {};

    this.logs.forEach((log) => {
      byLevel[log.level]++;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    const recentErrors = this.logs
      .filter((log) => log.level === "error")
      .slice(-5)
      .reverse();

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      recentErrors,
    };
  }

  clear(): void {
    this.logs = [];
  }

  subscribe(listener: (log: LogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  startTimer(category: string, action: string): () => void {
    const start = performance.now();
    return () => {
      const duration = Math.round(performance.now() - start);
      this.performance(`${category}: ${action}`, duration);
    };
  }
}

export const logger = new Logger();

export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const start = performance.now();
    
    res.on("finish", () => {
      const duration = Math.round(performance.now() - start);
      if (!req.path.startsWith("/api/logs")) {
        logger.api(req.method, req.path, res.statusCode, duration);
      }
    });

    next();
  };
}
