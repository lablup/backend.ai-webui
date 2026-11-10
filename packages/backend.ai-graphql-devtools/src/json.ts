declare global {
  interface JSON {
    rawJSON?(text: string): unknown;
  }
}

// `JSON.parse` source text access (TC39): keeps `9007199254740993` and `1.0` as written.
const keepNumberSource = (
  _key: string,
  value: unknown,
  context?: { source?: string },
) =>
  typeof value === 'number' && context?.source
    ? JSON.rawJSON?.(context.source)
    : value;

/** Parses JSON, keeping number source text when the browser supports `JSON.rawJSON`; `undefined` when invalid. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(
      text,
      JSON.rawJSON
        ? (keepNumberSource as (key: string, value: unknown) => unknown)
        : undefined,
    );
  } catch {
    return undefined;
  }
}

export function printJson(text: string): string {
  if (!JSON.rawJSON) return text;
  const value = parseJson(text);
  return value === undefined ? text : JSON.stringify(value, null, 2);
}

export const hasGraphQLErrors = (text: string) =>
  Boolean((parseJson(text) as { errors?: unknown[] } | null)?.errors?.length);
