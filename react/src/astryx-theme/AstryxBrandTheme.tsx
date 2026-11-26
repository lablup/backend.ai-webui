/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 App-level Astryx theme provider carrying the Backend.AI brand.

 - Theme: resolved against the live appearance document (family selection +
   operator overrides via `useCustomThemeConfig`); the shipped defaults hit the
   precompiled `astryx theme build` output instead of runtime injection (see
   `resolveRoleTheme`).
 - Mode: ALWAYS passed explicitly. The app owns light/dark via
   `useThemeMode` (localStorage + OS listener); handing Astryx `system`
   would let the OS preference override the user's explicit in-app choice.
 */
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { useThemeMode } from '../hooks/useThemeMode';
import AstryxThemeStyleKeeper from './AstryxThemeStyleKeeper';
import { resolveRoleTheme } from './resolveRoleTheme';
import { Theme as AstryxTheme } from '@lablup/ui-common/theme';
import React from 'react';

export interface AstryxBrandThemeProps {
  /**
   * `admin` gives the whole app the admin accent. The caller reads the route
   * scope, so this provider also renders without a router.
   */
  role?: 'brand' | 'admin';
  /**
   * Explicit mode override — probes/tests only. Defaults to the
   * app-resolved mode from `useThemeMode`.
   */
  mode?: 'light' | 'dark';
  children?: React.ReactNode;
}

const AstryxBrandTheme: React.FC<AstryxBrandThemeProps> = ({
  role = 'brand',
  mode,
  children,
}) => {
  'use memo';
  const { rawThemeConfig, activeThemeFamily } = useCustomThemeConfig();
  const { isDarkMode } = useThemeMode();
  const theme = resolveRoleTheme(
    rawThemeConfig?.theme,
    role,
    activeThemeFamily,
  );
  return (
    <AstryxTheme theme={theme} mode={mode ?? (isDarkMode ? 'dark' : 'light')}>
      {/* Must stay the first child: see the trap note in the component. */}
      <AstryxThemeStyleKeeper />
      {children}
    </AstryxTheme>
  );
};

export default AstryxBrandTheme;
