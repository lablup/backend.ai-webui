import { Col, ColorPicker, ColorPickerProps, Row, theme } from 'antd';
import { ComponentTokenMap } from 'antd/es/theme/interface';
import { AliasToken } from 'antd/lib/theme/internal';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useUserCustomThemeConfig } from 'src/hooks/useUserCustomThemeConfig';

type TokenPath = `token.${keyof AliasToken & string}`;
type ComponentPath = `components.${keyof ComponentTokenMap & string}.${string}`;
export type ThemeConfigPath = TokenPath | ComponentPath;

interface ThemeColorPickerSettingItemProps extends ColorPickerProps {
  tokenName?: ThemeConfigPath;
}
const ThemeColorPicker: React.FC<ThemeColorPickerSettingItemProps> = ({
  tokenName,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { getThemeValue, updateUserCustomThemeConfig } =
    useUserCustomThemeConfig();

  const lightModeColor = getThemeValue<string>(`light.${tokenName}`);
  const darkModeColor = getThemeValue<string>(`dark.${tokenName}`);

  const defaultLightTokens = theme.getDesignToken({
    algorithm: theme.defaultAlgorithm,
  });
  const defaultDarkTokens = theme.getDesignToken({
    algorithm: theme.darkAlgorithm,
  });

  return (
    <BAIFlex
      align="stretch"
      direction="column"
      style={{ alignSelf: 'stretch' }}
    >
      <Row gutter={[16, 4]}>
        <Col xl={6} lg={24}>
          <BAIFlex
            gap="sm"
            style={{ color: token.colorTextTertiary }}
            wrap="wrap"
          >
            {t('userSettings.LightMode')}:
            <ColorPicker
              format="hex"
              showText
              value={
                lightModeColor ??
                _.get(defaultLightTokens, _.last(_.split(tokenName, '.')) || '')
              }
              onChangeComplete={(value) => {
                updateUserCustomThemeConfig(
                  `light.${tokenName}`,
                  value.toHexString(),
                );
              }}
              style={{ minWidth: 110 }}
            />
          </BAIFlex>
        </Col>
        <Col xl={6} lg={24}>
          <BAIFlex
            gap="sm"
            style={{ color: token.colorTextTertiary }}
            wrap="wrap"
          >
            {t('userSettings.DarkMode')}:
            <ColorPicker
              format="hex"
              showText
              value={
                darkModeColor ??
                _.get(defaultDarkTokens, _.last(_.split(tokenName, '.')) || '')
              }
              onChangeComplete={(value) => {
                updateUserCustomThemeConfig(
                  `dark.${tokenName}`,
                  value.toHexString(),
                );
              }}
              style={{ minWidth: 110 }}
            />
          </BAIFlex>
        </Col>
      </Row>
    </BAIFlex>
  );
};

export default ThemeColorPicker;
