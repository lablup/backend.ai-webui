/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
import { useUserCustomThemeConfig } from '../../hooks/useUserCustomThemeConfig';
import { Col, Row, theme, Typography } from 'antd';
import { BAIFlex, BAIUncontrolledInput } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface LogoSizeSettingItemProps {
  logoType?: 'wide' | 'collapsed' | 'login' | 'about';
}

const LOGO_SIZE_CONFIG: Record<
  NonNullable<LogoSizeSettingItemProps['logoType']>,
  { key: string; defaultSize: { width?: number; height?: number } }
> = {
  wide: { key: 'logo.size', defaultSize: { width: 159, height: 24 } },
  collapsed: {
    key: 'logo.sizeCollapsed',
    defaultSize: { width: 24, height: 24 },
  },
  login: {
    key: 'logo.loginLogoSize',
    defaultSize: { height: 35 },
  },
  about: {
    key: 'logo.aboutLogoSize',
    defaultSize: { width: 159, height: 24 },
  },
};

const LogoSizeSettingItem: React.FC<LogoSizeSettingItemProps> = ({
  logoType = 'wide',
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { getThemeValue, updateUserCustomThemeConfig } =
    useUserCustomThemeConfig();

  const themeConfig = useCustomThemeConfig();
  const { key: sizeKey, defaultSize } = LOGO_SIZE_CONFIG[logoType];
  const rawSize = getThemeValue<{ width?: number; height?: number }>(sizeKey);

  // For about logo, fall back to deprecated aboutModalSize before defaults
  const deprecatedAboutSize =
    logoType === 'about' ? themeConfig?.logo?.aboutModalSize : undefined;

  const logoSizeConfig = {
    width: rawSize?.width ?? deprecatedAboutSize?.width ?? defaultSize.width,
    height:
      rawSize?.height ?? deprecatedAboutSize?.height ?? defaultSize.height,
  };

  return (
    <BAIFlex align="stretch" direction="column" style={{ width: '100%' }}>
      <Row gutter={[12, 4]}>
        <Col xl={6} lg={24}>
          <BAIFlex
            gap="sm"
            wrap="nowrap"
            style={{ color: token.colorTextTertiary }}
          >
            <Typography.Text type="secondary" style={{ wordBreak: 'keep-all' }}>
              {t('userSettings.logo.size.Width')}:
            </Typography.Text>
            <BAIUncontrolledInput
              type="number"
              defaultValue={logoSizeConfig.width?.toString() ?? ''}
              onCommit={(v) => {
                updateUserCustomThemeConfig(
                  `${sizeKey}.width`,
                  v ? Number(v) : undefined,
                );
              }}
              style={{ maxWidth: 150 }}
            />
          </BAIFlex>
        </Col>
        <Col xl={6} lg={24}>
          <BAIFlex
            gap="sm"
            wrap="nowrap"
            style={{ color: token.colorTextTertiary }}
          >
            <Typography.Text type="secondary" style={{ wordBreak: 'keep-all' }}>
              {t('userSettings.logo.size.Height')}:
            </Typography.Text>
            <BAIUncontrolledInput
              type="number"
              defaultValue={logoSizeConfig.height?.toString() ?? ''}
              onCommit={(v) => {
                updateUserCustomThemeConfig(
                  `${sizeKey}.height`,
                  v ? Number(v) : undefined,
                );
              }}
              style={{ maxWidth: 150 }}
            />
          </BAIFlex>
        </Col>
      </Row>
    </BAIFlex>
  );
};

export default LogoSizeSettingItem;
