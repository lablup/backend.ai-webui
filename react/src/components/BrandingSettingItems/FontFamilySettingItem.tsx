/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getStaticAppearanceConfig } from '../../helper/customThemeConfig';
import { usePreviewThemeConfig } from '../../hooks/usePreviewThemeConfig';
import { BAIUncontrolledInput } from 'backend.ai-ui';

const FontFamilySettingItem: React.FC = () => {
  'use memo';

  const { getThemeConfigValue, updateThemeConfigValue } =
    usePreviewThemeConfig();

  // Draft first, then the shipped theme.json — the same rule as the color
  // pickers. Neither declaring a font means the app renders Astryx's own, so
  // the field is simply empty rather than showing a made-up default.
  const fontFamily =
    getThemeConfigValue<string>('theme.fontFamily') ??
    getStaticAppearanceConfig()?.theme?.fontFamily ??
    '';

  return (
    <BAIUncontrolledInput
      defaultValue={fontFamily}
      onCommit={(v) => {
        updateThemeConfigValue('theme.fontFamily', v || undefined);
      }}
      style={{ alignSelf: 'stretch' }}
    />
  );
};

export default FontFamilySettingItem;
