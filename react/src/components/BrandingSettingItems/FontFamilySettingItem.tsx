/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultDesignToken } from '../../helper/defaultDesignTokens';
import { useDefaultTheme } from '../../hooks/useDefaultTheme';
import { BAIUncontrolledInput } from 'backend.ai-ui';

const FontFamilySettingItem: React.FC = () => {
  'use memo';

  const { getDefaultThemeValue, updateDefaultTheme } = useDefaultTheme();

  // Was `theme.getDesignToken({ algorithm: theme.defaultAlgorithm })` — the
  // last antd import in this file. `fontFamily` is a seed, so the shim-backed
  // helper returns antd's stock stack verbatim.
  const defaultTokens = getDefaultDesignToken('light');

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
