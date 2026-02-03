/**
 * Error Handling Utilities
 * 
 * Provides standardized error handling for the CRM API.
 */

import { z } from "zod";

export enum ErrorCode {
  // Standard HTTP errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  CONFLICT = "CONFLICT",
  BAD_REQUEST = "BAD_REQUEST",

  // Business logic errors
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION",
  ORGANIZATION_REQUIRED = "ORGANIZATION_REQUIRED",
  NO_ORGANIZATION_ACCESS = "NO_ORGANIZATION_ACCESS",

  // System errors
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMITED = "RATE_LIMITED",
}

export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
    Object.setPrototypeOf(this, APIError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
    };
  }
}

// Error factory functions
export const Errors = {
  // 400 Bad Request
  badRequest: (message = "Bad request") =>
    new APIError(ErrorCode.BAD_REQUEST, message, 400),

  validation: (errors: z.ZodError) =>
    new APIError(
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      400,
      errors.format()
    ),

  // 401 Unauthorized
  unauthorized: (message = "Authentication required") =>
    new APIError(ErrorCode.UNAUTHORIZED, message, 401),

  // 403 Forbidden
  forbidden: (message = "Access denied") =>
    new APIError(ErrorCode.FORBIDDEN, message, 403),

  organizationRequired: () =>
    new APIError(
      ErrorCode.ORGANIZATION_REQUIRED,
      "Organization access required",
      403
    ),

  noOrganizationAccess: () =>
    new APIError(
      ErrorCode.NO_ORGANIZATION_ACCESS,
      "You don't have access to this organization",
      403
    ),

  // 404 Not Found
  notFound: (resource: string) =>
    new APIError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  // 409 Conflict
  conflict: (message: string) =>
    new APIError(ErrorCode.CONFLICT, message, 409),

  // Business logic errors (422 Unprocessable Entity)
  insufficientStock: (itemName: string, available: number) =>
    new APIError(
      ErrorCode.INSUFFICIENT_STOCK,
      `Insufficient stock for ${itemName}. Only ${available} available.`,
      422,
      { itemName, available }
    ),

  invalidStatusTransition: (from: string, to: string) =>
    new APIError(
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Cannot transition from ${from} to ${to}`,
      422,
      { from, to }
    ),

  // 500 Internal Server Error
  database: (operation: string, details?: unknown) =>
    new APIError(
      ErrorCode.DATABASE_ERROR,
      `Database error during ${operation}`,
      500,
      details
    ),

  externalService: (service: string, details?: unknown) =>
    new APIError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `External service error: ${service}`,
      500,
      details
    ),

  server: (message = "Internal server error") =>
    new APIError(ErrorCode.SERVER_ERROR, message, 500),

  // 503 Service Unavailable
  serviceUnavailable: (service: string) =>
    new APIError(
      ErrorCode.SERVICE_UNAVAILABLE,
      `${service} is temporarily unavailable`,
      503
    ),

  // 429 Rate Limited
  rateLimited: (message = "Rate limit exceeded", retryAfter?: number) =>
    new APIError(
      ErrorCode.RATE_LIMITED,
      message,
      429,
      retryAfter ? { retryAfter } : undefined
    ),
};

// Error response formatter
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export function formatErrorResponse(error: APIError): ErrorResponse {
  const errorObj: ErrorResponse["error"] = {
    code: error.code,
    message: error.message,
  };

  if (error.details !== undefined) {
    errorObj.details = error.details;
  }

  return { error: errorObj };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof APIError) {
    return (
      error.statusCode >= 500 && error.statusCode < 600
    );
  }
  return false;
}

/**
 * Parse API error from response
 */
export function parseApiError(response: Response, data?: unknown): APIError {
  const statusCode = response.status;
  const errorData = data as { message?: string; error?: string; code?: string };

  switch (statusCode) {
    case 400:
      return Errors.badRequest(errorData?.message || errorData?.error || "Invalid request");
    case 401:
      return Errors.unauthorized(errorData?.message || errorData?.error);
    case 403:
      return Errors.forbidden(errorData?.message || errorData?.error);
    case 404:
      return Errors.notFound(errorData?.message || errorData?.error || "Resource");
    case 409:
      return Errors.conflict(errorData?.message || errorData?.error || "Conflict");
    case 429:
      return Errors.rateLimited(errorData?.message || "Too many requests");
    case 500:
    case 502:
    case 503:
    case 504:
      return Errors.server(errorData?.message || "Server error");
    default:
      return Errors.server(errorData?.message || errorData?.error || "Request failed");
  }
}
