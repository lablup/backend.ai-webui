import { Col, ColorPicker, ColorPickerProps, Row, theme } from 'antd';
import { ComponentTokenMap } from 'antd/es/theme/interface';
import { ThemeConfig } from 'antd/lib';
import { AliasToken } from 'antd/lib/theme/internal';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  CustomThemeConfig,
  useCustomThemeConfig,
} from 'src/helper/customThemeConfig';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

type TokenPath = `token.${keyof AliasToken & string}`;
type ComponentPath = `components.${keyof ComponentTokenMap & string}.${string}`;
type ThemeConfigPath = TokenPath | ComponentPath;

interface ThemeColorPickerSettingItemProps extends ColorPickerProps {
  tokenName?: ThemeConfigPath;
  afterChangeColor?: (config: CustomThemeConfig) => void;
}
const ThemeColorPicker: React.FC<ThemeColorPickerSettingItemProps> = ({
  tokenName,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [userCustomThemeConfig, setUserCustomThemeConfig] =
    useBAISettingUserState('custom_theme_config');

  const themeConfig = useCustomThemeConfig();

  const lightModeColor = (
    _.get(userCustomThemeConfig, `light.${tokenName}`) ||
    _.get(themeConfig, `light.${tokenName}`)
  )?.toString();
  const darkModeColor = (
    _.get(userCustomThemeConfig, `dark.${tokenName}`) ||
    _.get(themeConfig, `dark.${tokenName}`)
  )?.toString();

  return (
    <Row>
      <Col span={12}>
        <BAIFlex gap="sm" style={{ color: token.colorTextTertiary }}>
          {t('userSettings.LightMode')}:
          <ColorPicker
            format="hex"
            showText
            value={lightModeColor}
            onChangeComplete={(value) => {
              const newColor = value.toHexString();
              const newCustomThemeConfig: CustomThemeConfig = {
                ...userCustomThemeConfig,
                ...themeConfig!,
                light: {
                  ...(_.get(userCustomThemeConfig, 'light') ||
                    (_.get(themeConfig, 'light') as ThemeConfig)),
                },
              };
              _.set(newCustomThemeConfig, `light.${tokenName}`, newColor);
              setUserCustomThemeConfig(newCustomThemeConfig);
            }}
          />
        </BAIFlex>
      </Col>
      <Col span={12}>
        <BAIFlex gap="sm" style={{ color: token.colorTextTertiary }}>
          {t('userSettings.DarkMode')}:
          <ColorPicker
            format="hex"
            showText
            value={darkModeColor}
            onChangeComplete={(value) => {
              const newColor = value.toHexString();
              const newCustomThemeConfig: CustomThemeConfig = {
                ...userCustomThemeConfig,
                ...themeConfig!,
                dark: {
                  ...(_.get(userCustomThemeConfig, 'dark') ||
                    (_.get(themeConfig, 'dark') as ThemeConfig)),
                },
              };
              _.set(newCustomThemeConfig, `dark.${tokenName}`, newColor);
              setUserCustomThemeConfig(newCustomThemeConfig);
            }}
          />
        </BAIFlex>
      </Col>
    </Row>
  );
};

export default ThemeColorPicker;
