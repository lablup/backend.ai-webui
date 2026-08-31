/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3712 — `${type}` interpolation for rules whose type is inferred rather
 than declared. `validateRule` normalises `{}` to a `string`-typed rule before
 validating, so the failure message must interpolate the normalised type, not
 the raw rule's `undefined`.
 */
import { defaultValidateMessages } from './messages';
import { validateRules } from './validate';
import { describe, expect, it } from 'vitest';

// Default (parallel) mode always rejects with the per-rule summaries.
const collectErrors = (value: unknown, rules: any[]) =>
  validateRules(['resource_slots', 'cuda.device'], value, rules, {
    ...defaultValidateMessages,
  }).then(
    () => {
      throw new Error('validateRules resolved in parallel mode');
    },
    (summaries: { errors: any[] }[]) => summaries.flatMap((s) => s.errors),
  );

describe('validateRules — inferred-type message interpolation (FR-3712)', () => {
  it('interpolates ${type} as the normalised type for an empty rule', async () => {
    const errors = await collectErrors(1, [{}]);
    expect(errors).toEqual([
      "'resource_slots.cuda.device' is not a valid string",
    ]);
  });

  it('still resolves ${type} for an explicitly typed rule', async () => {
    const errors = await collectErrors('one', [{ type: 'number' }]);
    expect(errors).toEqual([
      "'resource_slots.cuda.device' is not a valid number",
    ]);
  });

  it('accepts a number under a declared number rule', async () => {
    const errors = await collectErrors(1, [{ type: 'number' }]);
    expect(errors).toEqual([]);
  });
});
