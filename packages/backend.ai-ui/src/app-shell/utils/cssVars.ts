import type { BrandingConfig, ColorTokens } from '../../branding-schema';
import { defaultBranding } from '../../branding-schema';
import type { CSSProperties } from 'react';

const COLOR_VAR_MAP: Record<keyof ColorTokens, string> = {
  primary: '--bai-color-primary',
  primaryHover: '--bai-color-primary-hover',
  headerBg: '--bai-header-bg',
  headerText: '--bai-header-text',
  siderBg: '--bai-sider-bg',
  siderText: '--bai-sider-text',
  siderActiveBg: '--bai-sider-active-bg',
  siderActiveText: '--bai-sider-active-text',
  siderBorder: '--bai-sider-border',
  contentBg: '--bai-content-bg',
  contentText: '--bai-content-text',
  borderColor: '--bai-border-color',
};

function mergeColors(
  base: ColorTokens | undefined,
  override: ColorTokens | undefined,
): ColorTokens {
  return { ...(base ?? {}), ...(override ?? {}) };
}

export function buildShellCssVars(
  branding: BrandingConfig | undefined,
  isDarkMode: boolean,
): CSSProperties {
  const merged: BrandingConfig = {
    ...defaultBranding,
    ...(branding ?? {}),
    colors: {
      light: mergeColors(
        defaultBranding.colors?.light,
        branding?.colors?.light,
      ),
      dark: mergeColors(defaultBranding.colors?.dark, branding?.colors?.dark),
    },
    sider: { ...defaultBranding.sider, ...(branding?.sider ?? {}) },
    header: { ...defaultBranding.header, ...(branding?.header ?? {}) },
  };

  const activeColors = isDarkMode ? merged.colors?.dark : merged.colors?.light;
  const vars: Record<string, string | number> = {};

  if (activeColors) {
    for (const [key, value] of Object.entries(activeColors)) {
      if (value === undefined) continue;
      const varName = COLOR_VAR_MAP[key as keyof ColorTokens];
      if (varName) vars[varName] = value;
    }
  }

  if (merged.sider?.widthExpanded !== undefined) {
    vars['--bai-sider-width-expanded'] = `${merged.sider.widthExpanded}px`;
  }
  if (merged.sider?.widthCollapsed !== undefined) {
    vars['--bai-sider-width-collapsed'] = `${merged.sider.widthCollapsed}px`;
  }
  if (merged.header?.height !== undefined) {
    vars['--bai-header-height'] = `${merged.header.height}px`;
  }
  if (merged.fontFamily) {
    vars['--bai-font-family'] = merged.fontFamily;
  }

  return vars as CSSProperties;
}
