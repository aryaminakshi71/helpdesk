/**
 * Simple structured logger for Cloudflare Workers
 *
 * Provides a pino-like API using console methods.
 * Works in edge environments without WeakRef dependency.
 */

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export interface Logger {
  trace: (obj: object | string, msg?: string) => void;
  debug: (obj: object | string, msg?: string) => void;
  info: (obj: object | string, msg?: string) => void;
  warn: (obj: object | string, msg?: string) => void;
  error: (obj: object | string, msg?: string) => void;
  fatal: (obj: object | string, msg?: string) => void;
  child: (bindings: Record<string, unknown>) => Logger;
}

export type CreateLoggerOptions = {
  service: string;
  environment?: string | null;
  level?: LogLevel;
  baseBindings?: Record<string, unknown>;
};

function createLogFunction(
  level: LogLevel,
  minLevel: LogLevel,
  bindings: Record<string, unknown>
) {
  return (objOrMsg: object | string, msg?: string) => {
    if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) return;

    const timestamp = new Date().toISOString();
    let logObj: Record<string, unknown>;

    if (typeof objOrMsg === "string") {
      logObj = { ...bindings, level, timestamp, msg: objOrMsg };
    } else {
      logObj = { ...bindings, ...objOrMsg, level, timestamp, msg };
    }

    const consoleMethod = level === "fatal" ? "error" : level === "trace" ? "debug" : level;
    console[consoleMethod](JSON.stringify(logObj));
  };
}

export function createLogger(options: CreateLoggerOptions): Logger {
  const { service, environment, baseBindings, level = "info" } = options;

  const bindings: Record<string, unknown> = {
    service,
    environment: environment ?? "development",
    ...baseBindings,
  };

  // Remove undefined/null values
  Object.keys(bindings).forEach((key) => {
    if (bindings[key] === undefined || bindings[key] === null) {
      delete bindings[key];
    }
  });

  const logger: Logger = {
    trace: createLogFunction("trace", level, bindings),
    debug: createLogFunction("debug", level, bindings),
    info: createLogFunction("info", level, bindings),
    warn: createLogFunction("warn", level, bindings),
    error: createLogFunction("error", level, bindings),
    fatal: createLogFunction("fatal", level, bindings),
    child: (childBindings: Record<string, unknown>) => {
      return createLogger({
        ...options,
        baseBindings: { ...bindings, ...childBindings },
      });
    },
  };

  return logger;
}

export function createRequestLogger(
  baseLogger: Logger,
  bindings: Record<string, unknown>
): Logger {
  return baseLogger.child(bindings);
}

/**
 * Default logger instance for the API service
 */
const defaultLogger = createLogger({
  service: "api",
  environment: "development",
});

/**
 * Create a request-scoped logger from a Request object
 */
export function createRequestLoggerFromRequest(
  request: Request,
  extra?: Record<string, unknown>
): Logger {
  const requestId =
    request.headers.get("x-request-id") ||
    request.headers.get("x-correlation-id") ||
    crypto.randomUUID();

  const url = new URL(request.url);
  return defaultLogger.child({
    requestId,
    method: request.method,
    path: url.pathname,
    ...extra,
  });
}

export { defaultLogger as logger };
