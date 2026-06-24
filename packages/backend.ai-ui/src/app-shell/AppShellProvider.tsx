import { defaultBranding } from '../branding-schema';
import { BrandingContext } from './hooks/useBranding';
import { ThemeModeContext, useThemeModeState } from './hooks/useThemeMode';
import { useAppShellStyles } from './styles';
import type { AppShellProviderProps } from './types';
import { buildAntdTheme } from './utils/antdTheme';
import { buildShellCssVars } from './utils/cssVars';
import { App as AntdApp, ConfigProvider } from 'antd';
import { useMemo } from 'react';

export function AppShellProvider({
  branding,
  defaultThemeMode = 'system',
  themeStorageKey = 'appShell.themeMode',
  children,
}: AppShellProviderProps) {
  const { styles, cx } = useAppShellStyles();
  const themeMode = useThemeModeState(defaultThemeMode, themeStorageKey);
  const resolvedBranding = branding ?? defaultBranding;

  const cssVars = useMemo(
    () => buildShellCssVars(resolvedBranding, themeMode.isDarkMode),
    [resolvedBranding, themeMode.isDarkMode],
  );

  const antdThemeConfig = useMemo(
    () => buildAntdTheme(resolvedBranding, themeMode.isDarkMode),
    [resolvedBranding, themeMode.isDarkMode],
  );

  const className = cx(
    styles.root,
    'bai-app-shell-root',
    themeMode.isDarkMode && 'bai-dark',
  );

  return (
    <BrandingContext.Provider value={resolvedBranding}>
      <ThemeModeContext.Provider value={themeMode}>
        <ConfigProvider theme={antdThemeConfig}>
          <AntdApp className={className} style={cssVars} component="div">
            {children}
          </AntdApp>
        </ConfigProvider>
      </ThemeModeContext.Provider>
    </BrandingContext.Provider>
  );
}
