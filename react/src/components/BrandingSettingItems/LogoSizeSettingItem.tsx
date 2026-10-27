/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { usePreviewThemeConfig } from '../../hooks/usePreviewThemeConfig';
import { Grid } from '@lablup/ui-common/Grid';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAIUncontrolledInput } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface LogoSizeSettingItemProps {
  logoType?: 'wide' | 'collapsed' | 'login' | 'about';
}

const LOGO_SIZE_CONFIG: Record<
  NonNullable<LogoSizeSettingItemProps['logoType']>,
  { key: string; defaultSize: { width?: number; height?: number } }
> = {
  wide: { key: 'branding.logo.size', defaultSize: { width: 159, height: 24 } },
  collapsed: {
    key: 'branding.logo.sizeCollapsed',
    defaultSize: { width: 24, height: 24 },
  },
  login: {
    key: 'branding.logo.loginLogoSize',
    defaultSize: { height: 35 },
  },
  about: {
    key: 'branding.logo.aboutLogoSize',
    defaultSize: { width: 159, height: 24 },
  },
};

const LogoSizeSettingItem: React.FC<LogoSizeSettingItemProps> = ({
  logoType = 'wide',
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();
  const { getThemeConfigValue, updateThemeConfigValue } =
    usePreviewThemeConfig();

  const { key: sizeKey, defaultSize } = LOGO_SIZE_CONFIG[logoType];
  const rawSize = getThemeConfigValue<{ width?: number; height?: number }>(
    sizeKey,
  );

  // For about logo, fall back to deprecated aboutModalSize before defaults
  const deprecatedAboutSize =
    logoType === 'about'
      ? getThemeConfigValue<{ width?: number; height?: number }>(
          'branding.logo.aboutModalSize',
        )
      : undefined;

  const logoSizeConfig = {
    width: rawSize?.width ?? deprecatedAboutSize?.width ?? defaultSize.width,
    height:
      rawSize?.height ?? deprecatedAboutSize?.height ?? defaultSize.height,
  };

  return (
    <BAIFlex align="stretch" direction="column" style={{ width: '100%' }}>
      {/* Responsive policy (ticket 14): container-driven Astryx Grid replaces
          `Row gutter={[12,4]}` + `Col xl={6} lg={24}` — same recipe as
          LightDarkColorPicker's light/dark pair. */}
      <Grid columns={{ minWidth: 200, max: 2 }} columnGap={3} rowGap={1}>
        <BAIFlex
          gap="sm"
          wrap="nowrap"
          style={{ color: token('--color-text-tertiary') }}
        >
          <Text color="secondary">{t('userSettings.logo.size.Width')}:</Text>
          <BAIUncontrolledInput
            type="number"
            defaultValue={logoSizeConfig.width?.toString() ?? ''}
            onCommit={(v) => {
              updateThemeConfigValue(
                `${sizeKey}.width`,
                v ? Number(v) : undefined,
              );
            }}
            style={{ maxWidth: 150 }}
          />
        </BAIFlex>
        <BAIFlex
          gap="sm"
          wrap="nowrap"
          style={{ color: token('--color-text-tertiary') }}
        >
          <Text color="secondary">{t('userSettings.logo.size.Height')}:</Text>
          <BAIUncontrolledInput
            type="number"
            defaultValue={logoSizeConfig.height?.toString() ?? ''}
            onCommit={(v) => {
              updateThemeConfigValue(
                `${sizeKey}.height`,
                v ? Number(v) : undefined,
              );
            }}
            style={{ maxWidth: 150 }}
          />
        </BAIFlex>
      </Grid>
    </BAIFlex>
  );
};

export default LogoSizeSettingItem;
