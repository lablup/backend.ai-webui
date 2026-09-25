import type { WebMCPInputSchema } from './types';
import { validateWebMCPInput, webMCPInvalidInput } from './validateWebMCPInput';

const schema: WebMCPInputSchema = {
  type: 'object',
  properties: {
    page: { type: 'string', enum: ['session', 'data'] },
    name: { type: 'string', minLength: 1, maxLength: 5 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    ratio: { type: 'number', maximum: 1 },
    open: { type: 'boolean' },
  },
  required: ['page'],
  additionalProperties: false,
};

describe('validateWebMCPInput', () => {
  it('accepts valid input and returns it', () => {
    const input = {
      page: 'data',
      name: 'abc',
      limit: 10,
      ratio: 0.5,
      open: true,
    };
    expect(validateWebMCPInput(schema, input)).toEqual({
      ok: true,
      value: input,
    });
  });

  it('reports a missing required property', () => {
    expect(validateWebMCPInput(schema, {})).toEqual({
      ok: false,
      issues: [{ path: 'page', message: 'is required' }],
    });
  });

  it('treats undefined and null input as an empty object', () => {
    const empty: WebMCPInputSchema = { type: 'object', properties: {} };
    expect(validateWebMCPInput(empty, undefined)).toEqual({
      ok: true,
      value: {},
    });
    expect(validateWebMCPInput(empty, null)).toEqual({ ok: true, value: {} });
  });

  it('rejects non-object input', () => {
    for (const input of [123, [], true]) {
      expect(validateWebMCPInput(schema, input)).toEqual({
        ok: false,
        issues: [{ path: '', message: 'must be an object' }],
      });
    }
  });

  it('parses a JSON string and rejects one that is not JSON', () => {
    expect(validateWebMCPInput(schema, '{"page":"session"}')).toEqual({
      ok: true,
      value: { page: 'session' },
    });
    expect(validateWebMCPInput(schema, 'page=session').ok).toBe(false);
  });

  it('checks type and enum', () => {
    const result = validateWebMCPInput(schema, { page: 123 });
    expect(result).toEqual({
      ok: false,
      issues: [{ path: 'page', message: 'must be a string' }],
    });
    expect(validateWebMCPInput(schema, { page: 'admin' })).toEqual({
      ok: false,
      issues: [{ path: 'page', message: 'must be one of "session", "data"' }],
    });
  });

  it('checks string length bounds', () => {
    expect(validateWebMCPInput(schema, { page: 'data', name: '' }).ok).toBe(
      false,
    );
    expect(
      validateWebMCPInput(schema, { page: 'data', name: 'toolong' }).ok,
    ).toBe(false);
  });

  it('checks integer, number and their bounds', () => {
    const issuesOf = (input: Record<string, unknown>) => {
      const result = validateWebMCPInput(schema, { page: 'data', ...input });
      return result.ok ? [] : result.issues.map((issue) => issue.message);
    };
    expect(issuesOf({ limit: 1.5 })).toEqual(['must be an integer']);
    expect(issuesOf({ limit: '10' })).toEqual(['must be an integer']);
    expect(issuesOf({ limit: 0 })).toEqual(['must be >= 1']);
    expect(issuesOf({ limit: 101 })).toEqual(['must be <= 100']);
    expect(issuesOf({ ratio: Number.NaN })).toEqual(['must be a number']);
    expect(issuesOf({ ratio: 2 })).toEqual(['must be <= 1']);
  });

  it('checks booleans strictly', () => {
    expect(validateWebMCPInput(schema, { page: 'data', open: 'true' })).toEqual(
      {
        ok: false,
        issues: [{ path: 'open', message: 'must be a boolean' }],
      },
    );
  });

  it('rejects unknown properties only when additionalProperties is false', () => {
    expect(validateWebMCPInput(schema, { page: 'data', extra: 1 })).toEqual({
      ok: false,
      issues: [{ path: 'extra', message: 'is not an accepted property' }],
    });
    expect(
      validateWebMCPInput(
        { ...schema, additionalProperties: undefined },
        { page: 'data', extra: 1 },
      ).ok,
    ).toBe(true);
  });

  it('does not treat inherited keys as declared properties', () => {
    expect(
      validateWebMCPInput(schema, { page: 'data', toString: 'x' }).ok,
    ).toBe(false);
  });

  it('collects every issue at once', () => {
    const result = validateWebMCPInput(schema, { limit: 'x', open: 1 });
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.issues.map((issue) => issue.path)).toEqual([
      'page',
      'limit',
      'open',
    ]);
  });
});

describe('webMCPInvalidInput', () => {
  it('returns a structured error naming each issue', () => {
    expect(
      webMCPInvalidInput([
        { path: 'page', message: 'must be a string' },
        { path: '', message: 'must be an object' },
      ]),
    ).toEqual({
      error: {
        code: 'invalid_input',
        message: '"page" must be a string; input must be an object',
        issues: [
          { path: 'page', message: 'must be a string' },
          { path: '', message: 'must be an object' },
        ],
      },
    });
  });
});
