/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 App-level Astryx theme provider carrying the Backend.AI brand
 (to-astryx ticket 02). Astryx counterpart of the root `ConfigProvider`
 theme in `DefaultProviders`.

 - Theme: resolved against the live `resources/theme.json` document (family
   selection + operator overrides via `useCustomThemeConfig`); the shipped
   defaults hit the precompiled `astryx theme build` output instead of
   runtime injection (see `resolveRoleTheme`).
 - Mode: ALWAYS passed explicitly. The app owns light/dark via
   `useThemeMode` (localStorage + OS listener); handing Astryx `system`
   would let the OS preference override the user's explicit in-app choice.
 */
import {
  useAppearanceSettled,
  useCustomThemeConfig,
} from '../hooks/useCustomThemeConfig';
import { useThemeMode } from '../hooks/useThemeMode';
import { resolveRoleTheme } from './resolveRoleTheme';
import { Theme as AstryxTheme } from '@astryxdesign/core/theme';
import React from 'react';

export interface AstryxBrandThemeProps {
  /**
   * Explicit mode override — probes/tests only. Defaults to the
   * app-resolved mode from `useThemeMode`.
   */
  mode?: 'light' | 'dark';
  children?: React.ReactNode;
}

const AstryxBrandTheme: React.FC<AstryxBrandThemeProps> = ({
  mode,
  children,
}) => {
  'use memo';
  const settled = useAppearanceSettled();
  const { appearance, activeThemeFamily } = useCustomThemeConfig();
  const { isDarkMode } = useThemeMode();
  const theme = resolveRoleTheme(appearance?.theme, 'brand', activeThemeFamily);
  // Hold the first paint until theme.json has settled (the splash stays up);
  // otherwise the page would paint Astryx's neutral theme and then flip.
  if (!settled) {
    return null;
  }
  return (
    <AstryxTheme theme={theme} mode={mode ?? (isDarkMode ? 'dark' : 'light')}>
      {children}
    </AstryxTheme>
  );
};

export default AstryxBrandTheme;
