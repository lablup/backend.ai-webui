/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Astryx counterpart of `ThemeAdminProvider` (to-astryx ticket 02): wraps an
 admin region in a nested `<Theme>` carrying the admin accent
 (theme.json `colorInfo`).

 The explicit `mode` is NOT optional politeness. Measured (pilot phase 3b +
 re-verified in this ticket's probe): a nested `<Theme>` with no `mode` prop
 falls back to `system` — NOT to the parent's resolved mode — so with
 OS=light and the app set to dark, the admin region renders light inside a
 dark page. `useTheme().mode` returns the nearest ancestor Theme's RESOLVED
 mode ('light' | 'dark', never 'system'), which is the Astryx equivalent of
 the `isParentDark` read `ThemeAdminProvider` performs on the parent
 ConfigProvider — and unlike the app-level `useThemeMode`, it also follows
 deliberately inverted/forced ancestor regions.
 */
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { resolveRoleTheme } from './resolveRoleTheme';
import { Theme as AstryxTheme, useTheme } from '@astryxdesign/core/theme';
import React from 'react';

export interface AstryxAdminThemeProps {
  children?: React.ReactNode;
}

const AstryxAdminTheme: React.FC<AstryxAdminThemeProps> = ({ children }) => {
  'use memo';
  const { rawThemeConfig, activeThemeFamily } = useCustomThemeConfig();
  // Nearest ancestor Theme's resolved mode — MUST be re-passed explicitly.
  const { mode } = useTheme();
  const theme = resolveRoleTheme(
    rawThemeConfig?.theme,
    'admin',
    activeThemeFamily,
  );
  return (
    <AstryxTheme theme={theme} mode={mode}>
      {children}
    </AstryxTheme>
  );
};

export default AstryxAdminTheme;
