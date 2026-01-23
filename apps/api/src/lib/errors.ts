/**
 * Custom Error Classes
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;
  constructor(
    message: string = "Rate limit exceeded",
    retryAfter?: number,
    code: string = "RATE_LIMITED"
  ) {
    super(message, 429, code, true);
    this.retryAfter = retryAfter;
  }
}
