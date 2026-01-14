import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import usePrimaryColors from '../hooks/usePrimaryColors';
import { theme, ConfigProvider, ConfigProviderProps, ThemeConfig } from 'antd';
import _ from 'lodash';
import React, { useContext } from 'react';

const ThemeSecondaryProvider: React.FC<ConfigProviderProps> = ({
  ...props
}) => {
  const themeConfig = useCustomThemeConfig();
  const config = useContext(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;
  const primaryColors = usePrimaryColors();

  const additionalThemeConfig = {
    token: { colorPrimary: primaryColors.secondary },
  } as ThemeConfig;
  return (
    <ConfigProvider
      {...props}
      theme={{
        ...(isParentDark
          ? _.merge({}, themeConfig?.dark, additionalThemeConfig, props.theme)
          : _.merge(
              {},
              themeConfig?.light,
              additionalThemeConfig,
              props.theme,
            )),
        algorithm: isParentDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    />
  );
};

export default ThemeSecondaryProvider;
