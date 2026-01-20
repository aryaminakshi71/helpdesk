/**
 * Workflow Types
 *
 * Common types for Cloudflare Workflows.
 */

/**
 * Base workflow event type
 */
export interface WorkflowEvent<T = unknown> {
  payload: T;
  timestamp: string;
}

/**
 * Workflow step result
 */
export interface WorkflowStep<T = unknown> {
  name: string;
  output: T;
}
