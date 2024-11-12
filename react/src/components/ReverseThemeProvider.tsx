import { useCustomThemeConfig } from '../helper/customThemeConfig';
import { useThemeMode } from '../hooks/useThemeMode';
import { theme, ConfigProvider, ConfigProviderProps } from 'antd';
import _ from 'lodash';
import React from 'react';

interface ReverseThemeProviderProps extends ConfigProviderProps {
  className?: string;
}
const ReverseThemeProvider: React.FC<ReverseThemeProviderProps> = ({
  ...props
}) => {
  const { isDarkMode } = useThemeMode();
  const themeConfig = useCustomThemeConfig();
  return (
    <ConfigProvider
      {...props}
      theme={{
        ...(isDarkMode
          ? _.merge({}, themeConfig?.light, props.theme)
          : _.merge({}, themeConfig?.dark, props.theme)),
        algorithm: isDarkMode ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    />
  );
};

export default ReverseThemeProvider;
