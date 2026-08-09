/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultDesignToken } from '../../helper/defaultDesignTokens';
import { useDefaultTheme } from '../../hooks/useDefaultTheme';
import LightDarkColorPicker from '../LightDarkColorPicker';
import * as _ from 'lodash-es';

/**
 * The design-token names the shim hands out, reached through its own
 * signature rather than `import type { AliasToken } from 'antd/lib/theme'` —
 * a type-only antd specifier still counts against the import-graph gate
 * (P15), and this set is the same one antd's `AliasToken` described.
 */
type DesignTokenName = keyof ReturnType<typeof getDefaultDesignToken> & string;

type TokenPath = `token.${DesignTokenName}`;
/**
 * `components.<AntdComponent>.<token>` (e.g. `components.Layout.headerBg`).
 * The component half was `keyof ComponentTokenMap`; it is a plain string now
 * for the same reason as above. The leaf was already untyped, and the paths
 * are literals written at the seven `BrandingSettingList` call sites.
 */
type ComponentPath = `components.${string}.${string}`;
export type ThemeConfigPath = TokenPath | ComponentPath;

interface ThemeColorPickerSettingItemProps {
  tokenName?: ThemeConfigPath;
}
const ThemeColorPicker: React.FC<ThemeColorPickerSettingItemProps> = ({
  tokenName,
}) => {
  'use memo';

  const { getDefaultThemeValue, updateDefaultTheme } = useDefaultTheme();

  const lightModeColor = getDefaultThemeValue<string>(`light.${tokenName}`);
  const darkModeColor = getDefaultThemeValue<string>(`dark.${tokenName}`);

  // Was `theme.getDesignToken({ algorithm: theme.<mode>Algorithm })`. The
  // shim-backed replacement reproduces antd's palette algorithm over antd's
  // own seeds — see helper/defaultDesignTokens.ts for the parity table and
  // the two documented differences.
  const defaultLightTokens = getDefaultDesignToken('light');
  const defaultDarkTokens = getDefaultDesignToken('dark');

  return (
    <LightDarkColorPicker
      light={{
        value:
          lightModeColor ??
          _.get(defaultLightTokens, _.last(_.split(tokenName, '.')) || ''),
        onChangeComplete: (value) => {
          updateDefaultTheme(`light.${tokenName}`, value);
        },
      }}
      dark={{
        value:
          darkModeColor ??
          _.get(defaultDarkTokens, _.last(_.split(tokenName, '.')) || ''),
        onChangeComplete: (value) => {
          updateDefaultTheme(`dark.${tokenName}`, value);
        },
      }}
    />
  );
};

export default ThemeColorPicker;
