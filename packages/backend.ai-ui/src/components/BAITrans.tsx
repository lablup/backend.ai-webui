// This file is the *only* BUI source location allowed to import `<Trans>`
// directly from `react-i18next`. Every other BUI file uses the `BAITrans`
// re-export below. The exception is wired via the `ignores` entry in
// `eslint.config.js`'s `no-restricted-imports` rule (FR-2986).
import { i18n as buiI18n } from '../locale';
import React from 'react';
import { Trans } from 'react-i18next';

type BAITransProps = Omit<React.ComponentProps<typeof Trans>, 'i18n'>;

/**
 * Wrapper around react-i18next's `<Trans>` that always binds the BUI
 * i18next instance via the `i18n` prop. BUI components must use this
 * instead of importing `<Trans>` directly so that translation lookups
 * never fall back to React Context (which would otherwise resolve
 * against the host's i18n and surface raw keys — see FR-2986 and
 * the `useBAIi18n` hook).
 *
 * The `i18n` prop is intentionally `Omit`ted from the public surface:
 * callers cannot override the bound instance, which makes the lookup
 * path provably consistent across every `<BAITrans>` usage.
 */
export const BAITrans = (props: BAITransProps) => {
  'use memo';
  // Forward all standard Trans props (children, components, count, defaults,
  // i18nKey, ns, parent, t, tOptions, values, shouldUnescape, …) while
  // forcing the i18n binding to BUI's instance.
  return <Trans {...props} i18n={buiI18n} />;
};
