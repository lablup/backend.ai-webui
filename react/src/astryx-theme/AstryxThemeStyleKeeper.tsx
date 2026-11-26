/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { resolveRoleTheme } from './resolveRoleTheme';
import { Theme as AstryxTheme } from '@lablup/ui-common/theme';
import React from 'react';

const KEPT_ROLES = ['brand', 'admin'] as const;

/**
 * Trap: Astryx injects a runtime theme's CSS from the first `<Theme>` that uses
 * it and removes it when that instance changes theme or unmounts, even while
 * other instances still use it. These instances never change theme (keyed by
 * name) and, as the first child of the app-level `<Theme>`, run their insertion
 * effect before every other one, so they own the CSS while the family is active.
 * ADR 0044.
 */
const AstryxThemeStyleKeeper: React.FC = () => {
  'use memo';
  const { rawThemeConfig, activeThemeFamily } = useCustomThemeConfig();
  return KEPT_ROLES.map((role) => {
    const theme = resolveRoleTheme(
      rawThemeConfig?.theme,
      role,
      activeThemeFamily,
    );
    // Empty on purpose: the wrapper is `display: contents`, so it draws nothing.
    return (
      <AstryxTheme key={theme.name} theme={theme} mode="light">
        {null}
      </AstryxTheme>
    );
  });
};

export default AstryxThemeStyleKeeper;
