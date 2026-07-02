/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { ColorPicker, theme } from 'antd';

/**
 * End-user primary-color control for the User Settings page. Owns the
 * `custom_primary_color` user setting; `useThemeFamily` reads it and overrides
 * `colorPrimary` on the active family (Ant Design's algorithm derives the rest
 * of the palette). Distinct from the admin
 * `BrandingSettingItems/ThemeColorPicker`, which edits the full default-theme
 * document.
 */
const ThemeAccentColorPicker: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  const [accent, setAccent] = useBAISettingUserState('custom_primary_color');

  return (
    <ColorPicker
      data-testid="theme-accent-color-picker"
      value={accent ?? token.colorPrimary}
      onChangeComplete={(color) => setAccent(color.toHexString())}
      allowClear
      onClear={() => setAccent(undefined)}
      showText
      disabledAlpha
    />
  );
};

export default ThemeAccentColorPicker;
