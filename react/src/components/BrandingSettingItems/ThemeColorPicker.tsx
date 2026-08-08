/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDefaultTheme } from '../../hooks/useDefaultTheme';
import LightDarkColorPicker from '../LightDarkColorPicker';
// FRONTIER (astryx/22): theme-ALGORITHM producer, skip-listed since ticket 09
// (`getDesignToken` reads the real antd default palette as the fallback for
// an unset token). `ColorPickerProps`/`ComponentTokenMap`/`AliasToken` are
// type-only. This component's only "chrome" is `LightDarkColorPicker`,
// already migrated (Astryx `Grid` + `BAIFlex`; the antd `ColorPicker` widget
// itself is a genuine gap component — see that file).
import { type ColorPickerProps, theme } from 'antd';
import { ComponentTokenMap } from 'antd/es/theme/interface';
import { AliasToken } from 'antd/lib/theme/internal';
import * as _ from 'lodash-es';

type TokenPath = `token.${keyof AliasToken & string}`;
type ComponentPath = `components.${keyof ComponentTokenMap & string}.${string}`;
export type ThemeConfigPath = TokenPath | ComponentPath;

interface ThemeColorPickerSettingItemProps extends ColorPickerProps {
  tokenName?: ThemeConfigPath;
}
const ThemeColorPicker: React.FC<ThemeColorPickerSettingItemProps> = ({
  tokenName,
}) => {
  'use memo';

  const { getDefaultThemeValue, updateDefaultTheme } = useDefaultTheme();

  const lightModeColor = getDefaultThemeValue<string>(`light.${tokenName}`);
  const darkModeColor = getDefaultThemeValue<string>(`dark.${tokenName}`);

  const defaultLightTokens = theme.getDesignToken({
    algorithm: theme.defaultAlgorithm,
  });
  const defaultDarkTokens = theme.getDesignToken({
    algorithm: theme.darkAlgorithm,
  });

  return (
    <LightDarkColorPicker
      light={{
        value:
          lightModeColor ??
          _.get(defaultLightTokens, _.last(_.split(tokenName, '.')) || ''),
        onChangeComplete: (value) => {
          updateDefaultTheme(`light.${tokenName}`, value.toHexString());
        },
      }}
      dark={{
        value:
          darkModeColor ??
          _.get(defaultDarkTokens, _.last(_.split(tokenName, '.')) || ''),
        onChangeComplete: (value) => {
          updateDefaultTheme(`dark.${tokenName}`, value.toHexString());
        },
      }}
    />
  );
};

export default ThemeColorPicker;
