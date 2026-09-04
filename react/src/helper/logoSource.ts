/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { LogoConfig } from './customThemeConfig';

export type DetailLogoArea = 'login' | 'about';
export type ThemeScheme = 'light' | 'dark';

/** Which rung of the fallback chain produced the image. */
export type LogoSourceKind = 'own' | 'inherited' | 'default';

export type ResolvedLogoSrc = {
  src: string;
  source: LogoSourceKind;
  /** The sider key the image is borrowed from; only set for `'inherited'`. */
  inheritedFrom?: 'src' | 'srcDark';
};

export const DETAIL_LOGO_KEYS = {
  login: { light: 'loginLogoSrc', dark: 'loginLogoSrcDark' },
  about: { light: 'aboutLogoSrc', dark: 'aboutLogoSrcDark' },
} as const satisfies Record<
  DetailLogoArea,
  Record<ThemeScheme, keyof LogoConfig>
>;

export const DEFAULT_DETAIL_LOGO_SRC = {
  login: {
    light: 'manifest/backend.ai-text.svg',
    dark: 'manifest/backend.ai-text-bgdark.svg',
  },
  about: {
    light: '/manifest/backend.ai-webui-black.svg',
    dark: '/manifest/backend.ai-webui-white.svg',
  },
} as const satisfies Record<DetailLogoArea, Record<ThemeScheme, string>>;

// The login form and the About modal sit on the page surface, whose polarity
// is the opposite of the sider's, so an unset detail logo borrows the sider
// asset of the other scheme.
const INHERITED_SIDER_KEY = { light: 'srcDark', dark: 'src' } as const;

/**
 * Resolve the login / About logo for one scheme: the area's own key, then
 * the opposite-scheme sider logo, then the built-in asset. An empty string
 * counts as unset. The single chain shared by the renderers and the Branding
 * editor, so the preview always shows what the page shows.
 */
export const resolveDetailLogoSrc = (
  logo: LogoConfig | undefined,
  area: DetailLogoArea,
  scheme: ThemeScheme,
): ResolvedLogoSrc => {
  const own = logo?.[DETAIL_LOGO_KEYS[area][scheme]];
  if (own) {
    return { src: own, source: 'own' };
  }
  const inheritedFrom = INHERITED_SIDER_KEY[scheme];
  const inherited = logo?.[inheritedFrom];
  if (inherited) {
    return { src: inherited, source: 'inherited', inheritedFrom };
  }
  return { src: DEFAULT_DETAIL_LOGO_SRC[area][scheme], source: 'default' };
};
