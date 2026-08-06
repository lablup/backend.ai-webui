/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 3 (cn-oss-removal / ticket 13) — the Astryx counterpart of
 `react/src/components/ThemeAdminProvider.tsx`.

 Wraps an admin region in a nested Astryx `<Theme>` carrying the admin accent,
 and — critically — passes `mode` explicitly.

 The explicit `mode` is not optional politeness. Measured in phase 3b: a nested
 `<Theme>` with no `mode` prop falls back to `system`, NOT to the parent's
 resolved mode. With OS=light and the app set to dark, the nested region
 rendered the LIGHT admin colour (#028DF2) inside a dark page. Passing `mode`
 fixed it (#009BDD, `color-scheme: dark`). This is the Astryx equivalent of the
 `isParentDark` read that `ThemeAdminProvider` already performs for antd.
*/
import { useThemeMode } from '../hooks/useThemeMode';
import { backendAiAdminTheme } from './backendAiTheme';
import { Theme as AstryxTheme } from '@astryxdesign/core/theme';
import React from 'react';

export interface AstryxAdminThemeProps {
  children?: React.ReactNode;
}

const AstryxAdminTheme: React.FC<AstryxAdminThemeProps> = ({ children }) => {
  'use memo';
  const { isDarkMode } = useThemeMode();
  return (
    <AstryxTheme
      theme={backendAiAdminTheme}
      // MUST be explicit — see the note above.
      mode={isDarkMode ? 'dark' : 'light'}
    >
      {children}
    </AstryxTheme>
  );
};

export default AstryxAdminTheme;
