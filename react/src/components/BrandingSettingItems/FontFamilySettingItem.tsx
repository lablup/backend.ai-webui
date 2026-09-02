/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ANTD_DEFAULT_FONT_FAMILY } from '../../helper/defaultDesignTokens';
import { useDefaultTheme } from '../../hooks/useDefaultTheme';
import { BAIUncontrolledInput } from 'backend.ai-ui';

const FontFamilySettingItem: React.FC = () => {
  'use memo';

  const { getDefaultThemeValue, updateDefaultTheme } = useDefaultTheme();

  const fontFamily =
    getDefaultThemeValue<string>('theme.fontFamily') ??
    ANTD_DEFAULT_FONT_FAMILY;

  return (
    <BAIUncontrolledInput
      defaultValue={fontFamily}
      onCommit={(v) => {
        updateDefaultTheme('theme.fontFamily', v || undefined);
      }}
      style={{ alignSelf: 'stretch' }}
    />
  );
};

export default FontFamilySettingItem;
