/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { type ThemeConfig } from 'antd';
import _ from 'lodash';

export type LogoConfig = {
  src: string;
  srcCollapsed: string;
  srcDark?: string;
  srcCollapsedDark?: string;
  alt?: string;
  href?: string;
  size?: {
    width?: number;
    height?: number;
  };
  sizeCollapsed?: {
    width?: number;
    height?: number;
  };
  loginLogoSrc?: string;
  loginLogoSrcDark?: string;
  loginLogoSize?: {
    width?: number;
    height?: number;
  };
  aboutLogoSrc?: string;
  aboutLogoSrcDark?: string;
  aboutLogoSize?: {
    width?: number;
    height?: number;
  };
  /** @deprecated Use `aboutLogoSize` instead. */
  aboutModalSize?: {
    width?: number;
    height?: number;
  };
};
export type SiderConfig = {
  theme?: 'light' | 'dark';
};
export type BrandingConfig = {
  companyName?: string;
  brandName?: string;
};
export type CustomThemeConfig = {
  fontFamily?: string;
  light: ThemeConfig;
  dark: ThemeConfig;
  logo: LogoConfig;
  sider?: SiderConfig;
  branding?: BrandingConfig;
};

let _customTheme: CustomThemeConfig | undefined;

export const getCustomTheme = () => _customTheme;

const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
]);

function parseFontFamilies(fontFamily: string): string[] {
  return fontFamily
    .split(',')
    .map((f) => f.trim().replace(/^['"]|['"]$/g, ''))
    .filter((f) => f.length > 0)
    .filter((f) => !GENERIC_FAMILIES.has(f.toLowerCase()))
    .filter((f) => !f.startsWith('-'));
}

function normalizeFontName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function injectFontCSS(fontFamilies: string[]) {
  const seen = new Set<string>();
  for (const family of fontFamilies) {
    const normalized = normalizeFontName(family);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const href = `resources/fonts/${normalized}/${normalized}.css`;
    if (document.querySelector(`link[href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

export const loadCustomThemeConfig = () => {
  fetch('resources/theme.json')
    .then((response) => response.json())
    .then((theme) => {
      if (_.isUndefined(theme.light)) {
        _customTheme = { light: theme, dark: theme, logo: theme.logo };
      } else {
        _customTheme = theme;
      }
      if (
        _customTheme &&
        process.env.NODE_ENV === 'development' &&
        process.env.REACT_APP_THEME_COLOR
      ) {
        _.set(
          _customTheme,
          'light.components.Layout.headerBg',
          process.env.REACT_APP_THEME_COLOR,
        );
        _.set(
          _customTheme,
          'dark.components.Layout.headerBg',
          process.env.REACT_APP_THEME_COLOR,
        );
      }

      // Propagate top-level fontFamily into light/dark tokens so Ant Design receives it
      if (_customTheme) {
        const topLevelFont = _customTheme.fontFamily;
        if (topLevelFont) {
          _.set(_customTheme, 'light.token.fontFamily', topLevelFont);
          _.set(_customTheme, 'dark.token.fontFamily', topLevelFont);
        }

        // Auto-load font CSS based on fontFamily in theme config
        const fontFamily =
          topLevelFont ??
          (_.get(_customTheme, 'light.token.fontFamily') as
            | string
            | undefined) ??
          (_.get(_customTheme, 'dark.token.fontFamily') as string | undefined);
        if (fontFamily) {
          injectFontCSS(parseFontFamilies(fontFamily));
        }
      }

      document.dispatchEvent(new CustomEvent('custom-theme-loaded'));
    });
};
