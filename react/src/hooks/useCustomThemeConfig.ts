/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CustomThemeConfig } from '../helper/customThemeConfig';
import { useThemeFamily } from './useThemeFamily';

/**
 * Returns the active `CustomThemeConfig` with `light`/`dark` resolved to the
 * selected theme family (and any custom accent applied). Family resolution and
 * the raw `theme.json`/preview-mode loading both live in `useThemeFamily` /
 * `useRawCustomThemeConfig`; this thin wrapper preserves the long-standing
 * `useCustomThemeConfig()` call sites (DefaultProviders, ReverseThemeProvider,
 * WebUISider, ...), which become family-aware with no change of their own.
 */
export const useCustomThemeConfig = (): CustomThemeConfig | undefined => {
  'use memo';
  return useThemeFamily().activeThemeConfig;
};
