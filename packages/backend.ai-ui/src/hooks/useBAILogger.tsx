export enum LogLevel {
  LOG = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export interface LogContext {
  level: LogLevel;
  args: any[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Plugin interface for extending logger behavior
 */
export interface LoggerPlugin {
  /**
   * Hook called before logging. Can modify the log context or abort logging.
   * @param context - The current log context
   * @returns Modified context to continue logging, or null to abort
   */
  beforeLog?(context: LogContext): LogContext | null;

  /**
   * Hook called after logging is completed
   * @param context - The log context that was used
   */
  afterLog?(context: LogContext): void;

  /**
   * Hook called when an error occurs during the logging process
   * @param error - The error that occurred
   * @param context - The log context when the error happened
   */
  onError?(error: Error, context: LogContext): void;
}

/**
 * BAI Logger class for structured logging with plugin support
 */
class Logger {
  private plugins: LoggerPlugin[] = [];
  private metadata: Record<string, any> = {};
  private enabled: boolean = process.env.NODE_ENV !== 'production';
  private static instance: Logger;

  private constructor() {
    // Singleton pattern: private constructor
  }

  use(plugin: LoggerPlugin): this {
    this.plugins.push(plugin);
    return this;
  }

  setMetadata(key: string, value: any): this {
    this.metadata[key] = value;
    return this;
  }

  clearMetadata(): this {
    this.metadata = {};
    return this;
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  private logging(level: LogLevel, ...args: any[]) {
    if (!this.enabled) return;

    let context: LogContext = {
      level,
      args,
      timestamp: new Date(),
      metadata: { ...this.metadata },
    };

    try {
      // Before hooks
      for (const plugin of this.plugins) {
        const result = plugin.beforeLog?.(context);
        if (result === null) return;
        if (result !== undefined) {
          context = result;
        }
      }

      // Actual log output
      const consoleMethods = [
        // eslint-disable-next-line no-console
        console.log,
        // eslint-disable-next-line no-console
        console.debug,
        // eslint-disable-next-line no-console
        console.info,
        // eslint-disable-next-line no-console
        console.warn,
        // eslint-disable-next-line no-console
        console.error,
      ];
      consoleMethods[level](...context.args);

      // After hooks
      for (const plugin of this.plugins) {
        plugin.afterLog?.(context);
      }
    } catch (error) {
      // Plugin error handling
      for (const plugin of this.plugins) {
        plugin.onError?.(error as Error, context);
      }
    }
  }

  log(...args: any[]) {
    this.logging(LogLevel.LOG, ...args);
  }

  debug(...args: any[]) {
    this.logging(LogLevel.DEBUG, ...args);
  }

  info(...args: any[]) {
    this.logging(LogLevel.INFO, ...args);
  }

  warn(...args: any[]) {
    this.logging(LogLevel.WARN, ...args);
  }

  error(...args: any[]) {
    this.logging(LogLevel.ERROR, ...args);
  }

  // Helper for method chaining
  withContext(key: string, value: any) {
    return new ContextualLogger(this, { [key]: value });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}

// Logger with context support
export class ContextualLogger {
  constructor(
    private baseLogger: Logger,
    private context: Record<string, any>,
  ) {}

  private withContext(fn: () => void) {
    this.baseLogger.setMetadata('context', this.context);
    try {
      fn();
    } finally {
      this.baseLogger.clearMetadata();
    }
  }

  log(...args: any[]) {
    this.withContext(() => this.baseLogger.log(...args));
  }

  debug(...args: any[]) {
    this.withContext(() => this.baseLogger.debug(...args));
  }

  info(...args: any[]) {
    this.withContext(() => this.baseLogger.info(...args));
  }

  warn(...args: any[]) {
    this.withContext(() => this.baseLogger.warn(...args));
  }

  error(...args: any[]) {
    this.withContext(() => this.baseLogger.error(...args));
  }
}

// Export Logger instance type (not the class itself)
export type BAILogger = Logger;

const useBAILogger = () => {
  return { logger: Logger.getInstance() };
};

export default useBAILogger;
