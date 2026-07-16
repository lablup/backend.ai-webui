import type { BrandingConfig, ColorTokens } from '../../branding-schema';
import { defaultBranding } from '../../branding-schema';
import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

function mergeColors(
  base: ColorTokens | undefined,
  override: ColorTokens | undefined,
): ColorTokens {
  return { ...(base ?? {}), ...(override ?? {}) };
}

/**
 * Convert a `#RRGGBB` hex color to an `rgba(r, g, b, alpha)` string.
 * Mirrors WebUI's `colorPrimaryWithAlpha` computation in BAIMenu.
 */
function hexToRgba(hex: string | undefined, alpha: number): string | undefined {
  if (!hex || hex[0] !== '#' || hex.length !== 7) return undefined;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Map BrandingConfig + dark-mode flag to antd's ThemeConfig.
 *
 * The component-token settings here come from the WebUI/FastTrack BAIMenu
 * inventory: 40px item height, pill-shape (20px radius), 16px horizontal
 * margin, 16px font (fontSizeLG), selected bg = primary @ 15% alpha
 * (handled by antd via colorPrimaryBg / itemSelectedBg).
 */
export function buildAntdTheme(
  branding: BrandingConfig | undefined,
  isDarkMode: boolean,
): ThemeConfig {
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
  const c = isDarkMode ? merged.colors?.dark : merged.colors?.light;

  return {
    algorithm: isDarkMode
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: c?.primary,
      colorLink: c?.primary,
      colorBgLayout: c?.contentBg,
      colorText: c?.contentText,
      colorBorder: c?.borderColor,
      colorBorderSecondary: c?.siderBorder,
      fontFamily: merged.fontFamily,
    },
    components: {
      Layout: {
        headerBg: c?.headerBg,
        headerColor: c?.headerText,
        headerHeight: merged.header?.height,
        headerPadding: '0 16px',
        siderBg: c?.siderBg,
        bodyBg: c?.contentBg,
      },
      Menu: {
        itemHeight: 40,
        itemBorderRadius: 20,
        itemMarginInline: 16,
        itemMarginBlock: 4,
        itemPaddingInline: 16,
        // Match WebUI's BAIMenu: items use fontSizeLG (16). Group titles stay
        // at 14 via inline style on Typography.Text — produces the visual
        // hierarchy where labels read as headings and items as body text.
        fontSize: 16,
        iconSize: 16,
        collapsedWidth: merged.sider?.widthCollapsed,
        // Selected-item background: primary @ 15% alpha (matches WebUI's BAIMenu)
        itemSelectedBg: hexToRgba(c?.primary, 0.15),
      },
      Button: {
        controlHeight: 36,
      },
    },
  };
}
