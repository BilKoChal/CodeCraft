/**
 * CodeCraft — Execution Type Definitions
 *
 * Defines the data model for code execution results.
 * Used by the execution service and console drawer.
 */

/** Result of a code execution */
export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
  exitCode?: number;
  duration: number;
  language: string;
}

/** Supported execution languages and their tiers */
export type ExecutionLanguage =
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'python'
  | 'cpp';

/** Execution tier — determines when the runtime is loaded */
export type ExecutionTier = 1 | 2 | 3 | 4;

/** Map of languages to their execution tier */
export const EXECUTION_TIERS: Record<ExecutionLanguage, ExecutionTier> = {
  javascript: 1,
  typescript: 1,
  html: 1,
  python: 2,
  cpp: 2,
} as const;

/** Configuration for an execution engine */
export interface ExecutionEngineConfig {
  language: ExecutionLanguage;
  tier: ExecutionTier;
  name: string;
  description: string;
  estimatedLoadSize?: string;
}
