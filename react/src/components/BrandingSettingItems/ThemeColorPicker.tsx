import { Col, ColorPicker, ColorPickerProps, Row, theme } from 'antd';
import { ComponentTokenMap } from 'antd/es/theme/interface';
import { AliasToken } from 'antd/lib/theme/internal';
import { BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { useUserCustomThemeConfig } from 'src/helper/customThemeConfig';

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
  const { getThemeValue, setUserCustomThemeConfig } =
    useUserCustomThemeConfig();

  const lightModeColor = getThemeValue<string>(
    `light.${tokenName}`,
  )?.toString();
  const darkModeColor = getThemeValue<string>(`dark.${tokenName}`)?.toString();

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
              value={lightModeColor}
              onChangeComplete={(value) => {
                setUserCustomThemeConfig(
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
              value={darkModeColor}
              onChangeComplete={(value) => {
                setUserCustomThemeConfig(
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
