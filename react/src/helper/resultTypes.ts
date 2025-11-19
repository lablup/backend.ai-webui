/**
 * Utility types for handling GraphQL @catch(to: RESULT) directive
 */

/**
 * Extract the success value type from a Result type
 */
export type ExtractResultValue<T> = T extends { ok: true; value: infer V }
  ? V
  : never;

/**
 * Extract the error type from a Result type
 */
export type ExtractResultError<T> = T extends { ok: false; errors: infer E }
  ? E
  : never;

/**
 * Type guard to check if a result is successful
 */
export function isOkResult<T>(result: {
  ok: boolean;
  value?: T;
  errors?: any;
}): result is { ok: true; value: T } {
  return result.ok === true;
}

/**
 * Type guard to check if a result has failed
 */
export function isErrorResult<E = any>(result: {
  ok: boolean;
  value?: any;
  errors?: E;
}): result is { ok: false; errors: E } {
  return result.ok === false;
}

/**
 * Helper to safely extract value from Result type
 */
export function getResultValue<T>(
  result: { ok: boolean; value?: T },
  defaultValue: T | null = null,
): T | null {
  return result.ok && result.value !== undefined ? result.value : defaultValue;
}
