/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { contrastRatio } from '../helper/colorSanitizer';
import { useThemeFamily } from '../hooks/useThemeFamily';
import { ColorPicker, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

/**
 * End-user accent-color control for the User Settings page. Writes through
 * `useThemeFamily().setAccent`, which overrides `colorPrimary` on the active
 * family (Ant Design's algorithm derives the rest of the palette). Distinct
 * from the admin `BrandingSettingItems/ThemeColorPicker`, which edits the full
 * per-user `custom_theme_config` object.
 */
const ThemeAccentColorPicker: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { accent, setAccent } = useThemeFamily();

  // The accent becomes the header background for color-only families, where the
  // header text is white. Warn when white-on-accent contrast is poor (below the
  // WCAG AA large-text threshold of 3:1).
  const showLowContrastWarning =
    !!accent && contrastRatio('#ffffff', accent) < 3;

  return (
    <BAIFlex direction="column" align="start" gap="xxs">
      <ColorPicker
        data-testid="theme-accent-color-picker"
        value={accent ?? token.colorPrimary}
        onChangeComplete={(color) => setAccent(color.toHexString())}
        allowClear
        onClear={() => setAccent(undefined)}
        showText
        disabledAlpha
      />
      {showLowContrastWarning && (
        <Typography.Text type="warning" style={{ fontSize: token.fontSizeSM }}>
          {t('userSettings.AccentLowContrastWarning')}
        </Typography.Text>
      )}
    </BAIFlex>
  );
};

export default ThemeAccentColorPicker;
