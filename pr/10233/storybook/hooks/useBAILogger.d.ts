export declare enum LogLevel {
    LOG = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4
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
declare class Logger {
    private plugins;
    private metadata;
    private enabled;
    private static instance;
    private constructor();
    use(plugin: LoggerPlugin): this;
    setMetadata(key: string, value: any): this;
    clearMetadata(): this;
    setEnabled(enabled: boolean): this;
    private logging;
    log(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    withContext(key: string, value: any): ContextualLogger;
    static getInstance(): Logger;
}
export declare class ContextualLogger {
    private baseLogger;
    private context;
    constructor(baseLogger: Logger, context: Record<string, any>);
    private withContext;
    log(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
export type BAILogger = Logger;
declare const useBAILogger: () => {
    logger: Logger;
};
export default useBAILogger;
