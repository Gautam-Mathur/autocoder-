type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

interface RunnerLogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, unknown>;
  duration?: number;
}

type LogListener = (entry: RunnerLogEntry) => void;

const LEVEL_STYLES: Record<LogLevel, { badge: string; text: string; icon: string }> = {
  debug: {
    badge: 'background:#334155;color:#94a3b8;padding:1px 6px;border-radius:3px;font-weight:600',
    text: 'color:#94a3b8',
    icon: '\u2500'
  },
  info: {
    badge: 'background:#0e4da4;color:#60a5fa;padding:1px 6px;border-radius:3px;font-weight:600',
    text: 'color:#93c5fd',
    icon: '\u25CF'
  },
  success: {
    badge: 'background:#14532d;color:#4ade80;padding:1px 6px;border-radius:3px;font-weight:600',
    text: 'color:#86efac',
    icon: '\u2714'
  },
  warn: {
    badge: 'background:#713f12;color:#fbbf24;padding:1px 6px;border-radius:3px;font-weight:600',
    text: 'color:#fcd34d',
    icon: '\u26A0'
  },
  error: {
    badge: 'background:#7f1d1d;color:#f87171;padding:1px 6px;border-radius:3px;font-weight:600',
    text: 'color:#fca5a5',
    icon: '\u2718'
  },
};

const CATEGORY_STYLES: Record<string, string> = {
  'WebContainer': 'background:#1e1b4b;color:#a78bfa;padding:1px 6px;border-radius:3px;font-weight:600',
  'PreWarm':      'background:#172554;color:#38bdf8;padding:1px 6px;border-radius:3px;font-weight:600',
  'NPM':          'background:#431407;color:#fb923c;padding:1px 6px;border-radius:3px;font-weight:600',
  'DevServer':    'background:#052e16;color:#34d399;padding:1px 6px;border-radius:3px;font-weight:600',
  'FileSystem':   'background:#1c1917;color:#a8a29e;padding:1px 6px;border-radius:3px;font-weight:600',
  'Pipeline':     'background:#312e81;color:#818cf8;padding:1px 6px;border-radius:3px;font-weight:600',
  'AutoRunner':   'background:#0c4a6e;color:#38bdf8;padding:1px 6px;border-radius:3px;font-weight:600',
  'CodeGen':      'background:#4a044e;color:#e879f9;padding:1px 6px;border-radius:3px;font-weight:600',
  'Validator':    'background:#365314;color:#a3e635;padding:1px 6px;border-radius:3px;font-weight:600',
  'ErrorFix':     'background:#450a0a;color:#fb7185;padding:1px 6px;border-radius:3px;font-weight:600',
  'Process':      'background:#292524;color:#d6d3d1;padding:1px 6px;border-radius:3px;font-weight:600',
  'Cache':        'background:#1e3a5f;color:#7dd3fc;padding:1px 6px;border-radius:3px;font-weight:600',
};

const DEFAULT_CATEGORY_STYLE = 'background:#1e293b;color:#cbd5e1;padding:1px 6px;border-radius:3px;font-weight:600';

class RunnerLogger {
  private logs: RunnerLogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs = 500;
  private timers: Map<string, number> = new Map();

  private formatTime(ts: number): string {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  }

  private emit(level: LogLevel, category: string, message: string, details?: Record<string, unknown>, duration?: number): void {
    const entry: RunnerLogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      details,
      duration,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.listeners.forEach(fn => fn(entry));

    const lvl = LEVEL_STYLES[level];
    const catStyle = CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE;
    const timeStr = this.formatTime(entry.timestamp);
    const durStr = duration != null ? ` (${duration}ms)` : '';

    const fmt = `%c${timeStr}%c %c${lvl.icon} ${level.toUpperCase()}%c %c${category}%c ${message}${durStr}`;
    const args = [
      fmt,
      'color:#64748b;font-weight:400',
      '',
      lvl.badge,
      '',
      catStyle,
      '',
    ];

    switch (level) {
      case 'error': console.error(...args); break;
      case 'warn': console.warn(...args); break;
      default: console.log(...args);
    }

    if (details && Object.keys(details).length > 0) {
      const detailStyle = 'color:#64748b;font-style:italic;margin-left:20px';
      for (const [key, value] of Object.entries(details)) {
        const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
        console.log(`%c  \u2514 ${key}: ${val}`, detailStyle);
      }
    }
  }

  debug(category: string, message: string, details?: Record<string, unknown>): void {
    this.emit('debug', category, message, details);
  }

  info(category: string, message: string, details?: Record<string, unknown>): void {
    this.emit('info', category, message, details);
  }

  success(category: string, message: string, details?: Record<string, unknown>, duration?: number): void {
    this.emit('success', category, message, details, duration);
  }

  warn(category: string, message: string, details?: Record<string, unknown>): void {
    this.emit('warn', category, message, details);
  }

  error(category: string, message: string, details?: Record<string, unknown>): void {
    this.emit('error', category, message, details);
  }

  startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  endTimer(label: string): number {
    const start = this.timers.get(label);
    if (start == null) return 0;
    this.timers.delete(label);
    return Math.round(performance.now() - start);
  }

  group(category: string, title: string): void {
    const catStyle = CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE;
    const timeStr = this.formatTime(Date.now());
    console.groupCollapsed(
      `%c${timeStr}%c %c${category}%c ${title}`,
      'color:#64748b;font-weight:400', '',
      catStyle, ''
    );
  }

  groupEnd(): void {
    console.groupEnd();
  }

  separator(label?: string): void {
    const line = label
      ? `\u2500\u2500\u2500 ${label} ${'─'.repeat(Math.max(0, 50 - label.length))}`
      : '\u2500'.repeat(60);
    console.log(`%c${line}`, 'color:#475569');
  }

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  getLogs(): RunnerLogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

export const runnerLog = new RunnerLogger();
export type { RunnerLogEntry, LogLevel as RunnerLogLevel, LogListener };
