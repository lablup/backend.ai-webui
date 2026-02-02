import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { theme, ConfigProvider, type ConfigProviderProps } from 'antd';
import _ from 'lodash';
import React, { useContext } from 'react';

interface ReverseThemeProviderProps extends ConfigProviderProps {
  className?: string;
}
const ReverseThemeProvider: React.FC<ReverseThemeProviderProps> = ({
  ...props
}) => {
  const themeConfig = useCustomThemeConfig();
  const config = useContext(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;

  return (
    <ConfigProvider
      {...props}
      theme={{
        ...(isParentDark
          ? _.merge({}, themeConfig?.light, props.theme)
          : _.merge({}, themeConfig?.dark, props.theme)),
        algorithm: isParentDark ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    />
  );
};

export default ReverseThemeProvider;
