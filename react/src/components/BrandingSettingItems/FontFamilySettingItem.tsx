/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useUserCustomThemeConfig } from '../../hooks/useUserCustomThemeConfig';
import { theme } from 'antd';
import { BAIUncontrolledInput } from 'backend.ai-ui';

const FontFamilySettingItem: React.FC = () => {
  'use memo';

  const { getThemeValue, updateUserCustomThemeConfig } =
    useUserCustomThemeConfig();

  const defaultTokens = theme.getDesignToken({
    algorithm: theme.defaultAlgorithm,
  });

  const fontFamily =
    getThemeValue<string>('fontFamily') ??
    getThemeValue<string>('light.token.fontFamily') ??
    defaultTokens.fontFamily;

  return (
    <BAIUncontrolledInput
      defaultValue={fontFamily}
      onCommit={(v) => {
        const value = v || undefined;
        updateUserCustomThemeConfig('fontFamily', value);
        updateUserCustomThemeConfig('light.token.fontFamily', value);
        updateUserCustomThemeConfig('dark.token.fontFamily', value);
      }}
      style={{ alignSelf: 'stretch' }}
    />
  );
};

export default FontFamilySettingItem;
