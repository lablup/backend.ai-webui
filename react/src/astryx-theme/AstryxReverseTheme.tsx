/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Astryx counterpart of `ReverseThemeProvider` (to-astryx ticket 24).

 The app header paints itself with the brand accent, so its contents need the
 OPPOSITE light/dark polarity from the page around it. antd expressed that by
 nesting a `ConfigProvider` whose `algorithm` was flipped relative to the
 parent; the Astryx expression is a nested `<Theme>` whose `mode` is the
 inverse of the nearest ancestor Theme's RESOLVED mode.

 As with `AstryxAdminTheme`, `mode` is mandatory, not politeness: a nested
 `<Theme>` with no `mode` falls back to `system`, not to the parent's resolved
 mode (MAPPING §5 `ConfigProvider`). `useTheme().mode` is always resolved
 ('light' | 'dark'), which is what makes the inversion well-defined even
 inside another deliberately inverted region.
*/
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { resolveRoleTheme } from './resolveRoleTheme';
import { Theme as AstryxTheme, useTheme } from '@astryxdesign/core/theme';
import React from 'react';

export interface AstryxReverseThemeProps {
  children?: React.ReactNode;
}

const AstryxReverseTheme: React.FC<AstryxReverseThemeProps> = ({
  children,
}) => {
  'use memo';
  const { themeConfig, activeThemeFamily } = useCustomThemeConfig();
  const { mode } = useTheme();
  const theme = resolveRoleTheme(themeConfig, 'brand', activeThemeFamily);
  return (
    <AstryxTheme theme={theme} mode={mode === 'dark' ? 'light' : 'dark'}>
      {children}
    </AstryxTheme>
  );
};

export default AstryxReverseTheme;
