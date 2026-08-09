/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import { Grid } from '@astryxdesign/core/Grid';
import {
  BAIColorPicker,
  BAIFlex,
  type BAIColorPickerProps,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

/**
 * Per-scheme picker props. Was `ColorPickerProps` (antd); `BAIColorPicker` is
 * the Astryx-era replacement for the widget itself — see its header for why
 * Astryx has no colour picker and what the rebuilt one covers.
 */
type SchemeColorPickerProps = Omit<BAIColorPickerProps, 'showText'>;

export interface LightDarkColorPickerProps {
  /** Props for the light-scheme picker (value, onChangeComplete, onClear, …). */
  light: SchemeColorPickerProps;
  /** Props for the dark-scheme picker (value, onChangeComplete, onClear, …). */
  dark: SchemeColorPickerProps;
}

/**
 * Shared presentational light/dark two-column colour-picker layout. The
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
      {/* Responsive policy (ticket 14): container-driven Astryx Grid replaces
          `Row gutter={[16,4]}` + `Col xl={6} lg={24}`. minWidth 300 keeps the
          two scheme fields side-by-side whenever ~600px is available and
          stacks them below; max 4 reproduces the antd xl={6} quarter-width
          track sizing on wide containers. gap unit = 4px (columnGap 16px /
          rowGap 4px = the former gutter). */}
      <Grid columns={{ minWidth: 300, max: 4 }} columnGap={4} rowGap={1}>
        {schemes.map(({ label, pickerProps }) => (
          <BAIFlex
            key={label}
            gap="sm"
            style={{ color: token.colorTextTertiary }}
            wrap="wrap"
          >
            {label}:
            <BAIColorPicker
              showText
              label={label}
              style={{ minWidth: 110 }}
              {...pickerProps}
            />
          </BAIFlex>
        ))}
      </Grid>
    </BAIFlex>
  );
};

export default LightDarkColorPicker;
