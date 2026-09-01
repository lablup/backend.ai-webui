/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Astryx counterpart of `ThemeSecondaryProvider` (to-astryx ticket 02): wraps
 a region in a nested `<Theme>` carrying the secondary accent (theme.json
 `colorSuccess`, mirroring `usePrimaryColors().secondary`).

 `mode` is passed explicitly from the nearest ancestor Theme's resolved mode
 — nested Astryx Themes do NOT inherit mode (they fall back to `system`).
 See `AstryxAdminTheme.tsx` for the measured failure this prevents.
 */
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { resolveRoleTheme } from './resolveRoleTheme';
import { Theme as AstryxTheme, useTheme } from '@astryxdesign/core/theme';
import React from 'react';

export interface AstryxSecondaryThemeProps {
  children?: React.ReactNode;
}

const AstryxSecondaryTheme: React.FC<AstryxSecondaryThemeProps> = ({
  children,
}) => {
  'use memo';
  const { appearance, activeThemeFamily } = useCustomThemeConfig();
  const { mode } = useTheme();
  const theme = resolveRoleTheme(
    appearance?.theme,
    'secondary',
    activeThemeFamily,
  );
  return (
    <AstryxTheme theme={theme} mode={mode}>
      {children}
    </AstryxTheme>
  );
};

export default AstryxSecondaryTheme;
