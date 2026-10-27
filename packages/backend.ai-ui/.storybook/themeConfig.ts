import { astryxBrandTheme } from './astryxBrandTheme';
import type { DefinedTheme } from '@lablup/ui-common/theme';
import { neutralTheme } from '@lablup/ui-common/theme/neutral';

export type ThemeStyle = 'astryx' | 'webui';

/**
 * A "Theme" toolbar preset (FR-3819). Since the theme-shim retirement
 * (FR-3605) every component reads the Astryx `<Theme>`, so a preset is just
 * the theme to mount: `astryx` is a brand-less baseline, `webui` the
 * Backend.AI brand.
 */
export interface ThemePreset {
  theme: DefinedTheme;
}

export const themePresets: Record<ThemeStyle, ThemePreset> = {
  astryx: { theme: neutralTheme },
  webui: { theme: astryxBrandTheme },
};
