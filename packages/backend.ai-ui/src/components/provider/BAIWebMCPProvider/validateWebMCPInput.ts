import type {
  WebMCPErrorResult,
  WebMCPInputIssue,
  WebMCPInputSchema,
  WebMCPPropertySchema,
} from './types';

export type WebMCPInputValidation =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; issues: Array<WebMCPInputIssue> };

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const checkProperty = (
  schema: WebMCPPropertySchema,
  value: unknown,
): string | null => {
  switch (schema.type) {
    case 'string': {
      if (typeof value !== 'string') return 'must be a string';
      if (schema.enum && !schema.enum.includes(value)) {
        return `must be one of ${schema.enum.map((v) => JSON.stringify(v)).join(', ')}`;
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        return `must be at least ${schema.minLength} characters`;
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        return `must be at most ${schema.maxLength} characters`;
      }
      return null;
    }
    case 'integer':
    case 'number': {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return `must be ${schema.type === 'integer' ? 'an integer' : 'a number'}`;
      }
      if (schema.type === 'integer' && !Number.isInteger(value)) {
        return 'must be an integer';
      }
      if (schema.enum && !schema.enum.includes(value)) {
        return `must be one of ${schema.enum.join(', ')}`;
      }
      if (schema.minimum !== undefined && value < schema.minimum) {
        return `must be >= ${schema.minimum}`;
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        return `must be <= ${schema.maximum}`;
      }
      return null;
    }
    case 'boolean':
      return typeof value === 'boolean' ? null : 'must be a boolean';
    default:
      return 'has an unsupported schema type';
  }
};

/**
 * Checks tool input against a flat `WebMCPInputSchema`. Browsers do not
 * enforce `inputSchema`, so every tool runs its input through this first.
 * `undefined`/`null` input counts as `{}`; a JSON string is parsed.
 */
export const validateWebMCPInput = (
  schema: WebMCPInputSchema,
  input: unknown,
): WebMCPInputValidation => {
  let candidate: unknown = input ?? {};
  if (typeof candidate === 'string') {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return {
        ok: false,
        issues: [{ path: '', message: 'must be a JSON object' }],
      };
    }
  }
  if (!isPlainObject(candidate)) {
    return { ok: false, issues: [{ path: '', message: 'must be an object' }] };
  }

  const issues: Array<WebMCPInputIssue> = [];
  for (const key of schema.required ?? []) {
    if (candidate[key] === undefined) {
      issues.push({ path: key, message: 'is required' });
    }
  }
  for (const [key, value] of Object.entries(candidate)) {
    const propertySchema = Object.prototype.hasOwnProperty.call(
      schema.properties,
      key,
    )
      ? schema.properties[key]
      : undefined;
    if (!propertySchema) {
      if (schema.additionalProperties === false) {
        issues.push({ path: key, message: 'is not an accepted property' });
      }
      continue;
    }
    if (value === undefined) continue;
    const message = checkProperty(propertySchema, value);
    if (message) issues.push({ path: key, message });
  }

  return issues.length > 0
    ? { ok: false, issues }
    : { ok: true, value: candidate };
};

/** The structured error a tool returns instead of throwing. */
export const webMCPError = (
  code: string,
  message: string,
  issues?: ReadonlyArray<WebMCPInputIssue>,
): WebMCPErrorResult => ({
  error: { code, message, ...(issues ? { issues } : {}) },
});

export const webMCPInvalidInput = (
  issues: ReadonlyArray<WebMCPInputIssue>,
): WebMCPErrorResult =>
  webMCPError(
    'invalid_input',
    issues
      .map((issue) =>
        issue.path
          ? `"${issue.path}" ${issue.message}`
          : `input ${issue.message}`,
      )
      .join('; '),
    issues,
  );
