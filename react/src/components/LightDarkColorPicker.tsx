/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Col, ColorPicker, type ColorPickerProps, Row, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

type SchemeColorPickerProps = ColorPickerProps & { 'data-testid'?: string };

export interface LightDarkColorPickerProps {
  /** Props for the light-scheme picker (value, onChangeComplete, onClear, …). */
  light: SchemeColorPickerProps;
  /** Props for the dark-scheme picker (value, onChangeComplete, onClear, …). */
  dark: SchemeColorPickerProps;
}

/**
 * Shared presentational light/dark two-column `ColorPicker` layout. The
 * persistence strategy is injected per scheme via props: the User Settings
 * accent picker (`ThemeAccentColorPicker`) writes the `custom_primary_color`
 * scheme override, while the Branding `ThemeColorPicker` writes the
 * default-theme document paths through `useDefaultTheme`.
 */
const LightDarkColorPicker: React.FC<LightDarkColorPickerProps> = ({
  light,
  dark,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const schemes = [
    { label: t('userSettings.LightMode'), pickerProps: light },
    { label: t('userSettings.DarkMode'), pickerProps: dark },
  ];

  return (
    <BAIFlex
      align="stretch"
      direction="column"
      style={{ alignSelf: 'stretch' }}
    >
      <Row gutter={[16, 4]}>
        {schemes.map(({ label, pickerProps }) => (
          <Col key={label} xl={6} lg={24}>
            <BAIFlex
              gap="sm"
              style={{ color: token.colorTextTertiary }}
              wrap="wrap"
            >
              {label}:
              <ColorPicker
                format="hex"
                showText
                style={{ minWidth: 110 }}
                {...pickerProps}
              />
            </BAIFlex>
          </Col>
        ))}
      </Row>
    </BAIFlex>
  );
};

export default LightDarkColorPicker;
