import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
export declare const BAITrans: (props: BAITransProps) => React.JSX.Element;
export {};
