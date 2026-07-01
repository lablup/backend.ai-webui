/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { theme, ConfigProvider, type ConfigProviderProps } from 'antd';
import * as _ from 'lodash-es';
import React, { useContext } from 'react';

interface ReverseThemeProviderProps extends ConfigProviderProps {
  className?: string;
  /**
   * When false, render children unchanged (no scheme reversal). Lets callers
   * decide per-context whether the reversed contrast is wanted, e.g. the
   * header keeps its reversed icons on a saturated theme family, but renders
   * children normally on a frosted "auto" family. Defaults to true.
   */
  enabled?: boolean;
}
const ReverseThemeProvider: React.FC<ReverseThemeProviderProps> = ({
  enabled = true,
  ...props
}) => {
  const themeConfig = useCustomThemeConfig();
  const config = useContext(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;

  if (!enabled) {
    return <>{props.children}</>;
  }

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
