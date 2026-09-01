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
    getDefaultThemeValue<string>('theme.fontFamily') ??
    defaultTokens.fontFamily;

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
