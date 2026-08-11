/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Default validate-message templates (to-astryx ticket 34).

 Same strings as rc-component's `form` `utils/messages`, restricted to the
 rule keys this repository uses. They are only the LAST-RESORT fallback: under
 `<FormConfigProvider>` (mounted app-wide in
 `react/src/components/DefaultProviders.tsx`) the `${label}`-based, LOCALIZED
 templates from BUI's own catalogs win, and those are what users actually see
 — see `./FormConfigProvider.tsx`. Keeping the `${name}` defaults means a Form
 rendered with no provider at all (tests, Storybook) still produces readable
 text, and that a locale missing one key falls back to English rather than to
 a dotted i18n key.
 */
import type { ValidateMessages } from './interface';

const typeTemplate = "'${name}' is not a valid ${type}";

export const defaultValidateMessages: ValidateMessages = {
  default: "Validation error on field '${name}'",
  required: "'${name}' is required",
  whitespace: "'${name}' cannot be empty",
  types: {
    string: typeTemplate,
    number: typeTemplate,
    object: typeTemplate,
    email: typeTemplate,
    url: typeTemplate,
  },
  string: {
    len: "'${name}' must be exactly ${len} characters",
    min: "'${name}' must be at least ${min} characters",
    max: "'${name}' cannot be longer than ${max} characters",
    range: "'${name}' must be between ${min} and ${max} characters",
  },
  number: {
    len: "'${name}' must equal ${len}",
    min: "'${name}' cannot be less than ${min}",
    max: "'${name}' cannot be greater than ${max}",
    range: "'${name}' must be between ${min} and ${max}",
  },
  array: {
    len: "'${name}' must be exactly ${len} in length",
    min: "'${name}' cannot be less than ${min} in length",
    max: "'${name}' cannot be greater than ${max} in length",
    range: "'${name}' must be between ${min} and ${max} in length",
  },
  pattern: {
    mismatch: "'${name}' does not match pattern ${pattern}",
  },
};

/**
 * Shallow-per-section merge, matching async-validator's `deepMerge`: a
 * provided `types` object is spread over the default `types` object rather
 * than replacing it, so a locale that only translates `required` keeps the
 * English type templates instead of losing them.
 */
export function mergeValidateMessages(
  ...sources: (ValidateMessages | undefined | null)[]
): ValidateMessages {
  const target: ValidateMessages = { ...defaultValidateMessages };
  sources.forEach((source) => {
    if (!source) return;
    Object.keys(source).forEach((key) => {
      const value = source[key];
      const existing = target[key];
      if (
        value &&
        typeof value === 'object' &&
        existing &&
        typeof existing === 'object'
      ) {
        target[key] = { ...existing, ...value };
      } else {
        target[key] = value;
      }
    });
  });
  return target;
}
