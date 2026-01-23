/**
 * Structured JSON Logger with Aggregation Support
 * 
 * Provides JSON logging with support for log aggregation services
 * (Datadog, Logtail, CloudWatch, etc.)
 */

import type { Logger } from "./index";
import { createLogger, type CreateLoggerOptions } from "./index";

export interface LogAggregationConfig {
  service?: "datadog" | "logtail" | "cloudwatch" | "custom";
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
}

export interface StructuredLoggerOptions extends CreateLoggerOptions {
  aggregation?: LogAggregationConfig;
  jsonOutput?: boolean;
}

let logBuffer: Array<Record<string, unknown>> = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flushLogs(config: LogAggregationConfig): Promise<void> {
  if (logBuffer.length === 0) return;
  if (!config.endpoint || !config.apiKey) return;

  const logs = logBuffer.splice(0, config.batchSize || 100);

  try {
    await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
        "DD-API-KEY": config.apiKey,
      },
      body: JSON.stringify({
        logs: logs.map((log) => ({
          ...log,
          service: config.service || "api",
          ddsource: "nodejs",
        })),
      }),
    });
  } catch (error) {
    console.error("Failed to send logs to aggregation service:", error);
    logs.forEach((log) => console.log(JSON.stringify(log)));
  }
}

export function createStructuredLogger(
  options: StructuredLoggerOptions
): Logger {
  const {
    aggregation,
    jsonOutput = process.env.NODE_ENV === "production",
    ...loggerOptions
  } = options;

  const baseLogger = createLogger(loggerOptions);

  if (aggregation?.endpoint && aggregation?.apiKey) {
    const flushInterval = aggregation.flushInterval || 5000;

    if (!flushTimer) {
      flushTimer = setInterval(() => {
        flushLogs(aggregation).catch(console.error);
      }, flushInterval);
    }
  }

  const structuredLogger: Logger = {
    trace: (obj: object | string, msg?: string) => {
      baseLogger.trace(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("trace", obj, msg, loggerOptions);
      }
    },
    debug: (obj: object | string, msg?: string) => {
      baseLogger.debug(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("debug", obj, msg, loggerOptions);
      }
    },
    info: (obj: object | string, msg?: string) => {
      baseLogger.info(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("info", obj, msg, loggerOptions);
      }
    },
    warn: (obj: object | string, msg?: string) => {
      baseLogger.warn(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("warn", obj, msg, loggerOptions);
      }
    },
    error: (obj: object | string, msg?: string) => {
      baseLogger.error(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("error", obj, msg, loggerOptions);
      }
    },
    fatal: (obj: object | string, msg?: string) => {
      baseLogger.fatal(obj, msg);
      if (aggregation && jsonOutput) {
        addToBuffer("fatal", obj, msg, loggerOptions);
        if (aggregation.endpoint && aggregation.apiKey) {
          flushLogs(aggregation).catch(console.error);
        }
      }
    },
    child: (bindings: Record<string, unknown>) => {
      return createStructuredLogger({
        ...options,
        baseBindings: { ...loggerOptions.baseBindings, ...bindings },
      });
    },
  };

  return structuredLogger;
}

function addToBuffer(
  level: string,
  obj: object | string,
  msg: string | undefined,
  options: CreateLoggerOptions
): void {
  const timestamp = new Date().toISOString();
  let logEntry: Record<string, unknown>;

  if (typeof obj === "string") {
    logEntry = {
      level,
      timestamp,
      service: options.service,
      environment: options.environment || "development",
      message: obj || msg,
      ...options.baseBindings,
    };
  } else {
    logEntry = {
      level,
      timestamp,
      service: options.service,
      environment: options.environment || "development",
      message: msg,
      ...options.baseBindings,
      ...obj,
    };
  }

  logBuffer.push(logEntry);
}

export async function flushPendingLogs(): Promise<void> {
  logBuffer = [];
}
