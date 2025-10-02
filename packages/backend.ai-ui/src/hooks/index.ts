import { useMemo } from 'react';

type UseMemoizedJsonParseOptions<T> = {
  fallbackValue: T;
};

/**
 * A custom React hook that memoizes the result of parsing a JSON string.
 *
 * @template T The expected type of the parsed JSON object.
 * @param jsonString - The JSON string to parse. If `undefined` or `null`, the `fallbackValue` is returned.
 * @param options - Optional configuration object.
 * @param options.fallbackValue - The value to return if parsing fails or if `jsonString` is not a string.
 * @returns The parsed JSON object of type `T`, or the `fallbackValue` if parsing fails.
 *
 * @example
 * const data = useMemoizedJSONParse<MyType>(jsonString, { fallbackValue: defaultValue });
 */
export function useMemoizedJSONParse<T = any>(
  jsonString: string | undefined | null,
  options?: UseMemoizedJsonParseOptions<T>,
): T {
  const { fallbackValue } = options || {};

  return useMemo(() => {
    if (typeof jsonString !== 'string') return fallbackValue;

    try {
      return JSON.parse(jsonString);
    } catch (err) {
      return fallbackValue;
    }
  }, [jsonString, fallbackValue]);
}

export { default as useErrorMessageResolver } from './useErrorMessageResolver';
export { default as useViewer } from './useViewer';
export type { ErrorResponse } from './useErrorMessageResolver';
export type { ESMClientErrorResponse } from './useErrorMessageResolver';
