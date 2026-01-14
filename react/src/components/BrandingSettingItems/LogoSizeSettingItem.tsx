import { Col, Row, theme, Typography } from 'antd';
import { BAIFlex, BAIUncontrolledInput } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { useUserCustomThemeConfig } from 'src/hooks/useUserCustomThemeConfig';

interface LogoSizeSettingItemProps {
  logoType?: 'wide' | 'collapsed';
}

const LogoSizeSettingItem: React.FC<LogoSizeSettingItemProps> = ({
  logoType = 'wide',
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { getThemeValue, updateUserCustomThemeConfig } =
    useUserCustomThemeConfig();

  const sizeKey = logoType === 'wide' ? 'logo.size' : 'logo.sizeCollapsed';
  const defaultSize =
    logoType === 'wide'
      ? { width: 159, height: 24 }
      : { width: 24, height: 24 };
  const logoSizeConfig =
    getThemeValue<{ width: number; height: number }>(sizeKey) ?? defaultSize;

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
              defaultValue={logoSizeConfig.width.toString()}
              onCommit={(v) => {
                updateUserCustomThemeConfig(`${sizeKey}.width`, Number(v));
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
              defaultValue={logoSizeConfig.height.toString()}
              onCommit={(v) => {
                updateUserCustomThemeConfig(`${sizeKey}.height`, Number(v));
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
