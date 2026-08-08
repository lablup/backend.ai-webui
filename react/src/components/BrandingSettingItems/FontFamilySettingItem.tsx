/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDefaultTheme } from '../../hooks/useDefaultTheme';
// FRONTIER (astryx/22): theme-ALGORITHM producer, skip-listed since ticket 09
// (`getDesignToken` reads the real antd default palette as a fallback). No
// other antd import/render lives in this file — its only "chrome" is
// `BAIUncontrolledInput`, a BUI frontier component (tickets 25/30).
import { theme } from 'antd';
import { BAIUncontrolledInput } from 'backend.ai-ui';

const FontFamilySettingItem: React.FC = () => {
  'use memo';

  const { getDefaultThemeValue, updateDefaultTheme } = useDefaultTheme();

  const defaultTokens = theme.getDesignToken({
    algorithm: theme.defaultAlgorithm,
  });

  const fontFamily =
    getDefaultThemeValue<string>('fontFamily') ??
    getDefaultThemeValue<string>('light.token.fontFamily') ??
    defaultTokens.fontFamily;

  return (
    <BAIUncontrolledInput
      defaultValue={fontFamily}
      onCommit={(v) => {
        const value = v || undefined;
        updateDefaultTheme('fontFamily', value);
        updateDefaultTheme('light.token.fontFamily', value);
        updateDefaultTheme('dark.token.fontFamily', value);
      }}
      style={{ alignSelf: 'stretch' }}
    />
  );
};

export default FontFamilySettingItem;
